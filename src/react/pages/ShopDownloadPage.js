import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useStore} from '@store';

import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import {pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {MENU_CATALOG_MODEL_CONFIG_KEY} from '@controleonline/ui-common/src/react/utils/menuCatalogConfig';
import {
  downloadMenuCatalog,
} from '@controleonline/ui-common/src/react/utils/menuCatalogDownload';

const buildSuccessMessage = downloadResult => {
  if (downloadResult?.shared) {
    return 'O PDF foi aberto para compartilhamento.';
  }

  if (downloadResult?.savedUri) {
    return `Arquivo salvo em ${downloadResult.savedUri}`;
  }

  return 'O download do cardapio foi iniciado.';
};

export default function ShopDownloadPage() {
  const navigation = useNavigation();
  const peopleStore = useStore('people');
  const peopleActions = peopleStore.actions;
  const {defaultCompany} = useShopCart();
  const [isDownloading, setIsDownloading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const isActiveRef = useRef(false);
  const hasStartedRef = useRef(false);
  const theme = pickTheme(defaultCompany);

  const companyName = useMemo(
    () =>
      defaultCompany?.alias ||
      defaultCompany?.name ||
      `Empresa ${defaultCompany?.id || ''}`.trim(),
    [defaultCompany?.alias, defaultCompany?.id, defaultCompany?.name],
  );

  const startDownload = useCallback(async () => {
    if (hasStartedRef.current) {
      return;
    }

    if (!defaultCompany?.id) {
      return;
    }

    hasStartedRef.current = true;
    if (!isActiveRef.current) {
      return;
    }

    setIsDownloading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await downloadMenuCatalog({
        companyId: defaultCompany.id,
        companyName,
        modelReference:
          defaultCompany?.configs?.[MENU_CATALOG_MODEL_CONFIG_KEY] || '',
      });

      if (!isActiveRef.current) {
        return;
      }

      setSuccessMessage(buildSuccessMessage(result));
    } catch (error) {
      if (!isActiveRef.current) {
        return;
      }

      setErrorMessage(
        error?.message || 'Nao foi possivel gerar o cardapio da empresa.',
      );
    } finally {
      if (isActiveRef.current) {
        setIsDownloading(false);
      }
    }
  }, [companyName, defaultCompany?.configs, defaultCompany?.id]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      isActiveRef.current = true;
      hasStartedRef.current = false;

      const run = async () => {
        if (!defaultCompany?.id) {
          setIsDownloading(true);
          setErrorMessage('');
          setSuccessMessage('');

          try {
            await peopleActions.defaultCompany();
          } catch (error) {
            if (!cancelled) {
              setErrorMessage(
                error?.message || 'Nao foi possivel identificar a empresa da vitrine.',
              );
              setIsDownloading(false);
            }
          }

          return;
        }

        if (!cancelled) {
          await startDownload();
        }
      };

      run();

      return () => {
        cancelled = true;
        isActiveRef.current = false;
      };
    }, [defaultCompany?.id, peopleActions, startDownload]),
  );

  return (
    <ShopShell
      searchValue=""
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }>
      {() => (
        <View
          style={[
            styles.container,
            {backgroundColor: theme.background},
          ]}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.cardBorder,
              },
            ]}>
            <Text style={[styles.eyebrow, {color: theme.accent}]}>
              Download do Cardapio
            </Text>
            <Text style={[styles.title, {color: theme.text}]}>
              {companyName}
            </Text>
            <Text style={[styles.description, {color: theme.muted}]}>
              O PDF e gerado com o modelo configurado nas configuracoes da
              empresa.
            </Text>

            {isDownloading ? (
              <View style={styles.feedbackBlock}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.feedbackText, {color: theme.text}]}>
                  Gerando e baixando o cardapio...
                </Text>
              </View>
            ) : errorMessage ? (
              <View style={styles.feedbackBlock}>
                <Text style={[styles.errorText, {color: theme.danger}]}>
                  {errorMessage}
                </Text>
              </View>
            ) : (
              <View style={styles.feedbackBlock}>
                <Text style={[styles.successText, {color: theme.success}]}>
                  {successMessage}
                </Text>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  styles.actionButton,
                  {backgroundColor: theme.primary},
                  isDownloading && styles.buttonDisabled,
                ]}
                disabled={isDownloading}
                onPress={() => {
                  hasStartedRef.current = false;
                  startDownload();
                }}>
                <Text style={styles.primaryButtonText}>Baixar novamente</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  styles.actionButton,
                  {borderColor: theme.cardBorder},
                ]}
                onPress={() => navigation.navigate('ShopIndex')}>
                <Text style={[styles.secondaryButtonText, {color: theme.text}]}>
                  Voltar para a loja
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ShopShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 720,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  feedbackBlock: {
    minHeight: 96,
    justifyContent: 'center',
    marginTop: 24,
  },
  feedbackText: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: '600',
  },
  successText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  actionButton: {
    marginRight: 12,
    marginBottom: 12,
  },
  primaryButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
