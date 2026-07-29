/*
 * Contract imported from AGENTS.md
 * ## Escopo
 * - `ui-shop` e o modulo React da vitrine e do fluxo de escolha de produtos.
 * - Esta pagina e a entrada do produto na loja e da configuracao de compra.
 *
 * ## Estado
 *
 * ## Limites
 * - Nao mover pagamento operacional para esta tela.
 * - Manter aqui apenas a experiencia da vitrine e a customizacao do produto.
 */
import React, {useCallback, useMemo, useState} from 'react';

import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import ShopSalesCompanySelector from '@controleonline/ui-shop/src/react/components/storefront/ShopSalesCompanySelector';
import ShopFeatureState from '@controleonline/ui-shop/src/react/components/storefront/ShopFeatureState';
import ShopQuantityControl from '@controleonline/ui-shop/src/react/components/storefront/ShopQuantityControl';
import ShopShell from '@controleonline/ui-shop/src/react/components/storefront/ShopShell';
import {openShopCustomize} from '@controleonline/ui-shop/src/react/utils/shopCustomizeNavigation';
import useShopCart from '@controleonline/ui-shop/src/react/hooks/useShopCart';
import useShopSalesCompany from '@controleonline/ui-shop/src/react/hooks/useShopSalesCompany';
import useShopSettings from '@controleonline/ui-shop/src/react/hooks/useShopSettings';
import {
  fetchShopCatalogProduct,
  getRememberedShopCatalogProduct,
  hasShopProductCustomizationGroups,
} from '@controleonline/ui-shop/src/react/utils/shopCatalog';

import {
  buildFileUrl,
  formatMoney,
  pickTheme,
} from '@controleonline/ui-shop/src/react/utils/shop';
import {SHOP_HOME_OPTION_SALES} from '@controleonline/ui-common/src/react/utils/shopConfig';

import {
  productPageScrollStyle,
  productPageContentStyle,
  productPageBackRowStyle,
  productPageBackButtonStyle,
  productPageBackTextStyle,
  productPageHeroStyle,
  productPageMediaPanelStyle,
  productPageMediaStyle,
  productPageMediaThumbImageStyle,
  productPageMediaThumbsStyle,
  productPageMediaThumbStyle,
  productPageMediaEmptyStyle,
  productPageInfoColumnStyle,
  productPageEyebrowStyle,
  productPageTitleStyle,
  productPagePriceStyle,
  productPageDescriptionStyle,
  productPageHelperChipStyle,
  productPageHelperChipTextStyle,
  productPageInlineActionWrapStyle,
  productPageLoadingActionStyle,
  productPageCustomizeButtonStyle,
  productPageCustomizeButtonTextStyle,
  productPageSimpleActionRowStyle,
  productPageQuantitySlotStyle,
  productPageCartButtonStyle,
  productPageCartButtonTextStyle,
  productPageDetailsCardStyle,
  productPageDetailsTitleStyle,
  productPageDetailsTextStyle,
  productPageMobileFooterStyle,
} from './ProductPage.styles';

export default function ProductPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const {width} = useWindowDimensions();
  const isMobile = width < 900;
  const productId = String(route.params?.id || '');
  const [product, setProduct] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [hasCustomizationGroups, setHasCustomizationGroups] = useState(false);
  const [isCheckingGroups, setIsCheckingGroups] = useState(false);
  const {cart, refreshCart, defaultCompany} = useShopCart();
  const {
    catalogProductTypes,
    franchiseLocatorEnabled,
    salesPageEnabled,
  } = useShopSettings();
  const catalogProductTypesKey = catalogProductTypes.join('|');
  const {
    isLoading: isLoadingSalesCompanies,
    requiresCompanySelection,
    salesCompany,
    salesCompanyOptions,
    selectSalesCompany,
  } = useShopSalesCompany();
  const detailCompany = useMemo(() => {
    const activeCompany = salesCompany || defaultCompany;
    const companyTheme = activeCompany?.theme || {};
    const companyColors = companyTheme?.colors || {};

    // Keep the web detail page readable even when a store theme is more contrast-heavy.
    return {
      ...activeCompany,
      theme: {
        ...companyTheme,
        colors: {
          ...companyColors,
          'text-primary': '#111827',
          'text-secondary': '#475569',
        },
      },
    };
  }, [defaultCompany, salesCompany]);
  const theme = pickTheme(detailCompany);

  useFocusEffect(
    useCallback(() => {
      if (!productId || requiresCompanySelection || !salesCompany?.id) {
        setProduct({});
        setHasCustomizationGroups(false);
        setIsCheckingGroups(false);
        return;
      }

      let isMounted = true;

      const loadProduct = async () => {
        setIsCheckingGroups(true);

        try {
          let nextProduct = {};
          const cachedProduct = getRememberedShopCatalogProduct(productId);
          nextProduct =
            cachedProduct ||
            (await fetchShopCatalogProduct({
              companyId: salesCompany.id,
              productId,
              productTypes: catalogProductTypes,
            }).catch(() => null)) ||
            {};

          if (!isMounted) {
            return;
          }

          setProduct(nextProduct);
          setSelectedImageIndex(0);

          const inlineRequiresCustomization =
            hasShopProductCustomizationGroups(nextProduct);
          setHasCustomizationGroups(inlineRequiresCustomization);
        } catch {
          if (isMounted) {
            setProduct({});
            setHasCustomizationGroups(false);
          }
        } finally {
          if (isMounted) {
            setIsCheckingGroups(false);
          }
        }
      };

      loadProduct();

      return () => {
        isMounted = false;
      };
    }, [
      catalogProductTypesKey,
      productId,
      requiresCompanySelection,
      salesCompany?.id,
    ]),
  );

  const productImages = useMemo(
    () =>
      (Array.isArray(product?.productFiles) ? product.productFiles : [])
        .map(productFile =>
          productFile?.file
            ? buildFileUrl(productFile.file, salesCompany || defaultCompany)
            : '',
        )
        .filter(Boolean),
    [defaultCompany, product?.productFiles, salesCompany],
  );
  const imageUrl = productImages[selectedImageIndex] || productImages[0] || '';
  const requiresCustomization = Boolean(
    product?.type === 'custom' || hasCustomizationGroups,
  );
  const productDescription = String(product?.description || '').trim();
  const detailsCopy = productDescription || 'Sem descricao adicional para este item.';
  const handleOpenCustomize = useCallback(
    () =>
      openShopCustomize({
        cart,
        navigation,
        presentation: isMobile ? 'bottomSheet' : null,
        productId: product?.id || product?.['@id'],
        redirectToCart: true,
        refreshCart,
      }),
    [cart, isMobile, navigation, product, refreshCart],
  );

  if (!salesPageEnabled) {
    return (
      <ShopShell
        activeHomeEntry={SHOP_HOME_OPTION_SALES}
        onSearch={query =>
          navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
        }
        showHomeEntryControls>
        {() => (
          <ScrollView style={productPageScrollStyle}>
            <ShopFeatureState
              theme={theme}
              iconName="inventory-2"
              title="Produto indisponivel"
              description="A pagina de vendas foi ocultada para esta empresa, entao os detalhes do produto nao ficam acessiveis."
              primaryActionLabel={
                franchiseLocatorEnabled ? 'Abrir localizador' : null
              }
              onPrimaryAction={
                franchiseLocatorEnabled
                  ? () => navigation.navigate('ShopFranchiseLocatorPage')
                  : null
              }
            />
          </ScrollView>
        )}
      </ShopShell>
    );
  }

  return (
    <ShopShell
      activeHomeEntry={SHOP_HOME_OPTION_SALES}
      showBottomCart={!requiresCompanySelection}
      onSearch={query =>
        navigation.navigate(query ? 'ShopSearchPage' : 'ShopIndex', {q: query})
      }
      showHomeEntryControls>
      {() => (
        <>
          {requiresCompanySelection ? (
            <ShopSalesCompanySelector
              companies={salesCompanyOptions}
              isLoading={isLoadingSalesCompanies}
              onSelect={selectSalesCompany}
              theme={theme}
              title="Escolha a unidade para ver o produto"
              description="Selecione primeiro a empresa que vai atender seu pedido."
            />
          ) : (
            <>
              <ScrollView
                contentContainerStyle={productPageContentStyle({
                  isMobile,
                })}
                style={productPageScrollStyle}>
                <View style={productPageBackRowStyle}>
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={productPageBackButtonStyle}>
                    <Icon name="arrow-back" size={20} color={theme.primary} />
                    <Text
                      style={productPageBackTextStyle({
                        theme,
                      })}>
                      Voltar
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={productPageHeroStyle({
                    isMobile,
                    theme,
                  })}>
                  <View
                    style={productPageMediaPanelStyle({
                      isMobile,
                      theme,
                    })}>
                    {imageUrl ? (
                      <Image
                        source={{uri: imageUrl}}
                        resizeMode="contain"
                        style={productPageMediaStyle({
                          isMobile,
                        })}
                      />
                    ) : (
                      <Text
                        style={productPageMediaEmptyStyle({
                          theme,
                        })}>
                        SEM IMAGEM
                      </Text>
                    )}
                    {productImages.length > 1 ? (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={productPageMediaThumbsStyle}>
                        {productImages.map((thumbUrl, index) => (
                          <TouchableOpacity
                            activeOpacity={0.85}
                            key={`${thumbUrl}-${index}`}
                            onPress={() => setSelectedImageIndex(index)}
                            style={productPageMediaThumbStyle({
                              isSelected: index === selectedImageIndex,
                              theme,
                            })}>
                            <Image
                              resizeMode="cover"
                              source={{uri: thumbUrl}}
                              style={productPageMediaThumbImageStyle}
                            />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    ) : null}
                  </View>

                  <View
                    style={productPageInfoColumnStyle({
                      isMobile,
                    })}>
                    {!isMobile ? (
                      <Text
                        style={productPageEyebrowStyle({
                          theme,
                        })}>
                        Detalhes do produto
                      </Text>
                    ) : null}

                    <Text
                      style={productPageTitleStyle({
                        isMobile,
                        theme,
                      })}>
                      {product?.product}
                    </Text>

                    <Text
                      style={productPagePriceStyle({
                        isMobile,
                        theme,
                      })}>
                      {formatMoney(product?.price)}
                    </Text>

                    {productDescription ? (
                      <Text
                        numberOfLines={isMobile ? 4 : 5}
                        style={productPageDescriptionStyle({
                          theme,
                        })}>
                        {productDescription}
                      </Text>
                    ) : null}

                    <View
                      style={productPageHelperChipStyle({
                        theme,
                        highlighted: requiresCustomization,
                      })}>
                      <Text
                        style={productPageHelperChipTextStyle({
                          theme,
                          highlighted: requiresCustomization,
                        })}>
                        {requiresCustomization
                          ? 'Abra a personalizacao para escolher os complementos'
                          : 'Adicione o item ao pedido em poucos toques'}
                      </Text>
                    </View>

                    {!isMobile ? (
                      <View style={productPageInlineActionWrapStyle}>
                        {isCheckingGroups ? (
                          <View
                            style={productPageLoadingActionStyle({
                              theme,
                            })}>
                            <ActivityIndicator color={theme.primary} />
                          </View>
                        ) : requiresCustomization ? (
                          <TouchableOpacity
                            onPress={handleOpenCustomize}
                            style={productPageCustomizeButtonStyle({
                              theme,
                            })}>
                            <Text
                              style={productPageCustomizeButtonTextStyle({
                                theme,
                              })}>
                              Personalizar
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <View
                            style={productPageSimpleActionRowStyle({
                              isMobile,
                            })}>
                            <View style={productPageQuantitySlotStyle}>
                              <ShopQuantityControl
                                product={product}
                                cart={cart}
                                refreshCart={refreshCart}
                                iconColor={theme.primary}
                              />
                            </View>

                            <TouchableOpacity
                              onPress={() => navigation.navigate('ShopCartPage')}
                              style={productPageCartButtonStyle({
                                theme,
                              })}>
                              <Text
                                style={productPageCartButtonTextStyle({
                                  theme,
                                })}>
                                Ir para carrinho
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ) : null}
                  </View>

                  {!isMobile ? (
                    <View
                      style={productPageDetailsCardStyle({
                        theme,
                      })}>
                      <Text
                        style={productPageDetailsTitleStyle({
                          theme,
                        })}>
                        Descricao
                      </Text>
                      <Text
                        style={productPageDetailsTextStyle({
                          theme,
                        })}>
                        {detailsCopy}
                      </Text>
                      {requiresCustomization ? (
                        <Text
                          style={productPageDetailsTextStyle({
                            theme,
                          })}>
                          Este item pode ser ajustado antes de entrar no pedido, com os complementos e escolhas da categoria.
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              </ScrollView>

              {isMobile ? (
                <View
                  style={productPageMobileFooterStyle({
                    theme,
                  })}>
                  {isCheckingGroups ? (
                    <View
                      style={productPageLoadingActionStyle({
                        theme,
                      })}>
                      <ActivityIndicator color={theme.primary} />
                    </View>
                  ) : requiresCustomization ? (
                    <TouchableOpacity
                      onPress={handleOpenCustomize}
                      style={productPageCustomizeButtonStyle({
                        theme,
                      })}>
                      <Text
                        style={productPageCustomizeButtonTextStyle({
                          theme,
                        })}>
                        Personalizar
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={productPageSimpleActionRowStyle({
                        isMobile,
                      })}>
                      <View style={productPageQuantitySlotStyle}>
                        <ShopQuantityControl
                          product={product}
                          cart={cart}
                          refreshCart={refreshCart}
                          iconColor={theme.primary}
                        />
                      </View>

                      <TouchableOpacity
                        onPress={() => navigation.navigate('ShopCartPage')}
                        style={productPageCartButtonStyle({
                          theme,
                        })}>
                        <Text
                          style={productPageCartButtonTextStyle({
                            theme,
                          })}>
                          Ir para carrinho
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : null}
            </>
          )}
        </>
      )}
    </ShopShell>
  );
}
// TODO(store-first): quando este arquivo for mexido, mover a leitura para stores, remover api.fetch e evitar repassar dados em objetos quando o store ja resolver isso.
