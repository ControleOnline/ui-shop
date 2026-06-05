import React, {useCallback, useMemo, useState} from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import styles from './CardsPage.styles';

import {
  inlineStyle_237_14,
  inlineStyle_239_12,
  inlineStyle_242_14,
  inlineStyle_250_16,
  inlineStyle_254_16,
  inlineStyle_262_20,
  inlineStyle_268_14,
  inlineStyle_277_16,
  inlineStyle_282_22,
  inlineStyle_286_22,
  inlineStyle_301_26,
  inlineStyle_303_24,
  inlineStyle_311_24,
  inlineStyle_321_24,
  inlineStyle_350_14,
  inlineStyle_359_16,
  inlineStyle_363_20,
  inlineStyle_382_24,
  inlineStyle_441_20,
  inlineStyle_498_16,
  inlineStyle_504_22,
  inlineStyle_512_16,
  inlineStyle_518_22,
  inlineStyle_526_12,
  inlineStyle_541_14,
  inlineStyle_550_20,
  inlineStyle_558_14,
  inlineStyle_570_22,
} from './CardsPage.styles';

import { inlineStyle_271_12 } from './CardsPage.styles';

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
  const authStore = useStore('auth');
  const {isLogged, sessionChecked} = authStore.getters;
  const {defaultCompany, currentCompany, salesCompany} = useShopCart();
  const {companyConfigs} = useShopSettings();
  const theme = pickTheme(salesCompany || defaultCompany);
  const effectiveCompanyConfigs = useMemo(() => {
    if (salesCompany?.configs && typeof salesCompany.configs === 'object') {
      return salesCompany.configs;
    }
    return companyConfigs || {};
  }, [companyConfigs, salesCompany?.configs]);
  const cardRegistrationEnabled = Boolean(effectiveCompanyConfigs?.['asaas-key']);

  const cardStore = useStore('card');
  const cardActions = cardStore.actions;

  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(initialForm);

  const loadCards = useCallback(async () => {
    if (!sessionChecked || !isLogged || !cardRegistrationEnabled) {
      setCards([]);
      return;
    }

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
  }, [cardActions, cardRegistrationEnabled, isLogged, sessionChecked]);

  useFocusEffect(
    useCallback(() => {
      if (!sessionChecked || !isLogged) {
        return;
      }

      loadCards();
      setForm(previous => ({
        ...previous,
        name: previous.name || getHolderName(currentCompany),
        document: previous.document || getCompanyDocument(currentCompany),
      }));
    }, [currentCompany, isLogged, loadCards, sessionChecked]),
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
    if (!cardRegistrationEnabled) {
      setError('Cadastro de cartão indisponível para esta loja.');
      return;
    }

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
  }, [cardActions, cardRegistrationEnabled, loadCards, validatePayload]);

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
        <View style={inlineStyle_237_14}>
          <ScrollView
            style={inlineStyle_239_12}
            contentContainerStyle={inlineStyle_271_12}>
            {!cardRegistrationEnabled ? (
              <View
                style={inlineStyle_268_14({
                  theme: theme,
                })}>
                <Text
                  style={inlineStyle_277_16({
                    theme: theme,
                  })}>
                  Cartão indisponível
                </Text>
                <Text style={inlineStyle_286_22({
                  theme: theme,
                })}>
                  Esta loja ainda não possui integração Asaas configurada para pagamento online com cartão.
                </Text>
              </View>
            ) : (
              <>
            <View
              style={inlineStyle_242_14({
                theme: theme,
              })}>
              <Text
                style={inlineStyle_250_16({
                  theme: theme,
                })}>
                CARTEIRA
              </Text>
              <Text
                style={inlineStyle_254_16({
                  theme: theme,
                })}>
                Meus cartões
              </Text>
              <Text style={inlineStyle_262_20({
                theme: theme,
              })}>
                Cadastre e gerencie seus cartões para pagar em poucos toques.
              </Text>
            </View>

            <View
              style={inlineStyle_268_14({
                theme: theme,
              })}>
              <Text
                style={inlineStyle_277_16({
                  theme: theme,
                })}>
                Cartões salvos
              </Text>

              {isLoading ? (
                <View style={inlineStyle_282_22}>
                  <ActivityIndicator color={theme.primary} />
                </View>
              ) : cards.length === 0 ? (
                <Text style={inlineStyle_286_22({
                  theme: theme,
                })}>
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
                    <View style={inlineStyle_301_26}>
                      <Text
                        style={inlineStyle_303_24({
                          theme: theme,
                        })}>
                        {(card?.type || 'credit').toUpperCase()}
                      </Text>
                      <Text
                        style={inlineStyle_311_24({
                          theme: theme,
                        })}>
                        {card?.number_group_1 || '****'} •••• ••••{' '}
                        {card?.number_group_4 || '****'}
                      </Text>
                      <Text
                        style={inlineStyle_321_24({
                          theme: theme,
                        })}>
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
              style={inlineStyle_350_14({
                theme: theme,
              })}>
              <Text
                style={inlineStyle_359_16({
                  theme: theme,
                })}>
                Novo cartão
              </Text>

              <View style={inlineStyle_363_20}>
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
                        style={inlineStyle_382_24({
                          selected: selected,
                          theme: theme,
                        })}>
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

              <View style={inlineStyle_441_20}>
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
                style={inlineStyle_498_16({
                  theme: theme,
                })}>
                <Text style={inlineStyle_504_22({
                  theme: theme,
                })}>
                  {error}
                </Text>
              </View>
            )}

            {!!message && (
              <View
                style={inlineStyle_512_16({
                  theme: theme,
                })}>
                <Text style={inlineStyle_518_22({
                  theme: theme,
                })}>
                  {message}
                </Text>
              </View>
            )}
              </>
            )}
          </ScrollView>

          <View
            style={inlineStyle_526_12({
              theme: theme,
            })}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ShopCheckoutPage')}
              style={inlineStyle_541_14({
                theme: theme,
              })}>
              <Text style={inlineStyle_550_20({
                theme: theme,
              })}>
                Voltar ao checkout
              </Text>
            </TouchableOpacity>

            {cardRegistrationEnabled && (
            <TouchableOpacity
              onPress={handleSaveCard}
              disabled={isSaving}
              style={inlineStyle_558_14({
                isSaving: isSaving,
                theme: theme,
              })}>
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={inlineStyle_570_22}>
                  Salvar cartão
                </Text>
              )}
            </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </ShopShell>
  );
}
