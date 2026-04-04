import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';

const extractItems = response => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.member)) return response.member;
  if (Array.isArray(response?.['hydra:member']))
    return response['hydra:member'];
  return [];
};

const digitsOnly = value => String(value || '').replace(/\D/g, '');

const formatCardNumber = value => {
  const digits = digitsOnly(value).slice(0, 16);
  const groups = [];
  for (let index = 0; index < digits.length; index += 4) {
    groups.push(digits.slice(index, index + 4));
  }
  return groups.join(' ');
};

const getCompanyDocument = company => {
  const list = Array.isArray(company?.document) ? company.document : [];
  const first = list[0]?.document || '';
  return digitsOnly(first);
};

const getHolderName = company =>
  String(company?.realname || company?.alias || company?.name || '').trim();

const normalizeMonth = value => {
  const month = digitsOnly(value).slice(0, 2);
  if (!month) return '';
  const number = Number(month);
  if (Number.isNaN(number) || number < 1 || number > 12) return null;
  return String(number).padStart(2, '0');
};

const normalizeYear = value => {
  const year = digitsOnly(value).slice(0, 4);
  if (!year) return '';
  if (year.length === 2) {
    return `20${year}`;
  }
  return year.length === 4 ? year : null;
};

const initialForm = {
  type: 'credit',
  name: '',
  document: '',
  number: '',
  expirationMonth: '',
  expirationYear: '',
  ccv: '',
};

export default function CardsPage() {
  const navigation = useNavigation();
  const {defaultCompany, currentCompany} = useShopCart();
  const theme = pickTheme(defaultCompany);

  const cardStore = useStore('card');
  const cardActions = cardStore.actions;

  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(initialForm);

  const loadCards = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await cardActions.getItems({itemsPerPage: 200});
      setCards(extractItems(response));
    } catch (e) {
      setError(e?.message || 'Não foi possível carregar os cartões salvos.');
    } finally {
      setIsLoading(false);
    }
  }, [cardActions]);

  useFocusEffect(
    useCallback(() => {
      loadCards();
      setForm(previous => ({
        ...previous,
        name: previous.name || getHolderName(currentCompany),
        document: previous.document || getCompanyDocument(currentCompany),
      }));
    }, [currentCompany, loadCards]),
  );

  const numberDigits = useMemo(() => digitsOnly(form.number), [form.number]);

  const validatePayload = useCallback(() => {
    if (!currentCompany?.id) {
      throw new Error(
        'Não foi possível identificar o cliente para salvar o cartão.',
      );
    }

    if (numberDigits.length !== 16) {
      throw new Error('Informe um número de cartão com 16 dígitos.');
    }

    const groups = [
      numberDigits.slice(0, 4),
      numberDigits.slice(4, 8),
      numberDigits.slice(8, 12),
      numberDigits.slice(12, 16),
    ];

    const month = normalizeMonth(form.expirationMonth);
    if (month === null || month === '') {
      throw new Error('Mês de validade inválido.');
    }

    const year = normalizeYear(form.expirationYear);
    if (year === null || year === '') {
      throw new Error('Ano de validade inválido.');
    }

    const ccv = digitsOnly(form.ccv).slice(0, 4);
    if (ccv.length < 3) {
      throw new Error('Código de segurança inválido.');
    }

    const document = digitsOnly(form.document);
    if (document.length < 11) {
      throw new Error('Informe um CPF/CNPJ válido para o titular.');
    }

    const holderName = String(form.name || '').trim();
    if (holderName.length < 3) {
      throw new Error('Informe o nome completo do titular.');
    }

    return {
      people_id: Number(currentCompany.id),
      type: form.type || 'credit',
      name: holderName,
      document,
      number_group_1: groups[0],
      number_group_2: groups[1],
      number_group_3: groups[2],
      number_group_4: groups[3],
      expiration_month: month,
      expiration_year: year,
      ccv,
    };
  }, [
    currentCompany?.id,
    form.ccv,
    form.document,
    form.expirationMonth,
    form.expirationYear,
    form.name,
    form.type,
    numberDigits,
  ]);

  const handleSaveCard = useCallback(async () => {
    setError('');
    setMessage('');
    setIsSaving(true);
    try {
      const payload = validatePayload();
      await cardActions.save(payload);
      setMessage('Cartão salvo com sucesso.');
      setForm(previous => ({
        ...previous,
        number: '',
        expirationMonth: '',
        expirationYear: '',
        ccv: '',
      }));
      await loadCards();
    } catch (e) {
      setError(e?.message || 'Não foi possível salvar este cartão.');
    } finally {
      setIsSaving(false);
    }
  }, [cardActions, loadCards, validatePayload]);

  const handleDeleteCard = useCallback(
    card => {
      if (!card?.id) return;

      const removeCard = async () => {
        setError('');
        setMessage('');
        try {
          await cardActions.remove(card.id);
          setMessage('Cartão removido com sucesso.');
          await loadCards();
        } catch (e) {
          setError(e?.message || 'Não foi possível remover este cartão.');
        }
      };

      if (
        typeof window !== 'undefined' &&
        typeof window.confirm === 'function'
      ) {
        if (window.confirm('Deseja remover este cartão salvo?')) {
          removeCard();
        }
        return;
      }

      Alert.alert('Remover cartão', 'Deseja remover este cartão salvo?', [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Remover', style: 'destructive', onPress: removeCard},
      ]);
    },
    [cardActions, loadCards],
  );

  return (
    <ShopShell
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <View style={{flex: 1}}>
          <ScrollView
            style={{flex: 1}}
            contentContainerStyle={{padding: 14, paddingBottom: 126}}>
            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: `${theme.primary}30`,
                backgroundColor: `${theme.primary}10`,
                padding: 14,
              }}>
              <Text
                style={{color: theme.primary, fontSize: 12, fontWeight: '800'}}>
                CARTEIRA
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  color: theme.text,
                  fontSize: 22,
                  fontWeight: '800',
                }}>
                Meus cartões
              </Text>
              <Text style={{marginTop: 6, color: theme.muted, fontSize: 13}}>
                Cadastre e gerencie seus cartões para pagar em poucos toques.
              </Text>
            </View>

            <View
              style={{
                marginTop: 12,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                backgroundColor: theme.surface,
                padding: 14,
              }}>
              <Text
                style={{color: theme.text, fontSize: 16, fontWeight: '800'}}>
                Cartões salvos
              </Text>

              {isLoading ? (
                <View style={{paddingVertical: 20, alignItems: 'center'}}>
                  <ActivityIndicator color={theme.primary} />
                </View>
              ) : cards.length === 0 ? (
                <Text style={{marginTop: 10, color: theme.muted}}>
                  Nenhum cartão salvo ainda.
                </Text>
              ) : (
                cards.map(card => (
                  <View
                    key={card.id}
                    style={[
                      styles.cardItem,
                      {
                        marginTop: 10,
                        borderColor: theme.cardBorder,
                        backgroundColor: `${theme.primary}10`,
                      },
                    ]}>
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          color: theme.text,
                          fontSize: 12,
                          fontWeight: '800',
                        }}>
                        {(card?.type || 'credit').toUpperCase()}
                      </Text>
                      <Text
                        style={{
                          marginTop: 2,
                          color: theme.text,
                          fontSize: 16,
                          fontWeight: '800',
                        }}>
                        {card?.number_group_1 || '****'} •••• ••••{' '}
                        {card?.number_group_4 || '****'}
                      </Text>
                      <Text
                        style={{
                          marginTop: 2,
                          color: theme.muted,
                          fontSize: 12,
                        }}>
                        {card?.name || 'Titular'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteCard(card)}
                      style={[
                        styles.iconButton,
                        {
                          borderColor: `${theme.danger}40`,
                          backgroundColor: `${theme.danger}18`,
                        },
                      ]}>
                      <Icon
                        name="delete-outline"
                        size={20}
                        color={theme.danger}
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            <View
              style={{
                marginTop: 12,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                backgroundColor: theme.surface,
                padding: 14,
              }}>
              <Text
                style={{color: theme.text, fontSize: 16, fontWeight: '800'}}>
                Novo cartão
              </Text>

              <View style={{marginTop: 12, flexDirection: 'row', gap: 8}}>
                {['credit', 'debit'].map(type => {
                  const selected = form.type === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setForm(previous => ({...previous, type}))}
                      style={[
                        styles.typeChip,
                        {
                          borderColor: selected
                            ? theme.primary
                            : theme.cardBorder,
                          backgroundColor: selected
                            ? `${theme.primary}18`
                            : '#fff',
                        },
                      ]}>
                      <Text
                        style={{
                          color: selected ? theme.primary : theme.text,
                          fontWeight: '700',
                          textTransform: 'capitalize',
                        }}>
                        {type === 'credit' ? 'Crédito' : 'Débito'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                value={form.name}
                onChangeText={value =>
                  setForm(previous => ({...previous, name: value}))
                }
                placeholder="Nome do titular"
                placeholderTextColor={theme.muted}
                style={[
                  styles.input,
                  {borderColor: theme.cardBorder, color: theme.text},
                ]}
              />

              <TextInput
                value={form.document}
                onChangeText={value =>
                  setForm(previous => ({
                    ...previous,
                    document: digitsOnly(value).slice(0, 14),
                  }))
                }
                keyboardType="numeric"
                placeholder="CPF/CNPJ do titular"
                placeholderTextColor={theme.muted}
                style={[
                  styles.input,
                  {borderColor: theme.cardBorder, color: theme.text},
                ]}
              />

              <TextInput
                value={form.number}
                onChangeText={value =>
                  setForm(previous => ({
                    ...previous,
                    number: formatCardNumber(value),
                  }))
                }
                keyboardType="numeric"
                placeholder="Número do cartão"
                placeholderTextColor={theme.muted}
                style={[
                  styles.input,
                  {borderColor: theme.cardBorder, color: theme.text},
                ]}
              />

              <View style={{flexDirection: 'row', gap: 8}}>
                <TextInput
                  value={form.expirationMonth}
                  onChangeText={value =>
                    setForm(previous => ({
                      ...previous,
                      expirationMonth: digitsOnly(value).slice(0, 2),
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="MM"
                  placeholderTextColor={theme.muted}
                  style={[
                    styles.input,
                    styles.smallInput,
                    {borderColor: theme.cardBorder, color: theme.text},
                  ]}
                />
                <TextInput
                  value={form.expirationYear}
                  onChangeText={value =>
                    setForm(previous => ({
                      ...previous,
                      expirationYear: digitsOnly(value).slice(0, 4),
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="AAAA"
                  placeholderTextColor={theme.muted}
                  style={[
                    styles.input,
                    styles.smallInput,
                    {borderColor: theme.cardBorder, color: theme.text},
                  ]}
                />
                <TextInput
                  value={form.ccv}
                  onChangeText={value =>
                    setForm(previous => ({
                      ...previous,
                      ccv: digitsOnly(value).slice(0, 4),
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="CVV"
                  placeholderTextColor={theme.muted}
                  style={[
                    styles.input,
                    styles.smallInput,
                    {borderColor: theme.cardBorder, color: theme.text},
                  ]}
                />
              </View>
            </View>

            {!!error && (
              <View
                style={{
                  marginTop: 12,
                  borderRadius: 12,
                  padding: 10,
                  backgroundColor: `${theme.danger}18`,
                }}>
                <Text style={{color: theme.danger, fontWeight: '700'}}>
                  {error}
                </Text>
              </View>
            )}

            {!!message && (
              <View
                style={{
                  marginTop: 10,
                  borderRadius: 12,
                  padding: 10,
                  backgroundColor: `${theme.success}18`,
                }}>
                <Text style={{color: theme.success, fontWeight: '700'}}>
                  {message}
                </Text>
              </View>
            )}
          </ScrollView>

          <View
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              backgroundColor: theme.surface,
              padding: 10,
              flexDirection: 'row',
              gap: 10,
            }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ShopCheckoutPage')}
              style={{
                flex: 1,
                minHeight: 46,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{color: theme.text, fontWeight: '700'}}>
                Voltar ao checkout
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSaveCard}
              disabled={isSaving}
              style={{
                flex: 1,
                minHeight: 46,
                borderRadius: 12,
                backgroundColor: theme.primary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isSaving ? 0.7 : 1,
              }}>
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{color: '#fff', fontWeight: '800'}}>
                  Salvar cartão
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ShopShell>
  );
}

const styles = StyleSheet.create({
  cardItem: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  smallInput: {
    flex: 1,
  },
});
