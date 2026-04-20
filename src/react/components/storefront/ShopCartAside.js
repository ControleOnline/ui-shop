import React, {useMemo} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {formatMoney, pickTheme} from '@controleonline/ui-shop/src/react/utils/shop';
import {
  cartAsidePanelStyle,
  cartAsideHeaderStyle,
  cartAsideTitleStyle,
  cartAsideHintStyle,
  cartAsideCountStyle,
  cartAsideBodyStyle,
  cartAsideEmptyStyle,
  cartAsideEmptyTitleStyle,
  cartAsideListStyle,
  cartAsideRowStyle,
  cartAsideRowNameStyle,
  cartAsideRowMetaStyle,
  cartAsideFooterStyle,
  cartAsideTotalLabelStyle,
  cartAsideTotalValueStyle,
  cartAsideButtonStyle,
  cartAsideButtonTextStyle,
} from '@controleonline/ui-shop/src/react/components/storefront/ShopCartAside.styles';

// Keep the desktop order summary visible without replacing the dedicated cart page.
export default function ShopCartAside({
  company = null,
  cart = {},
  onOpenCart = null,
}) {
  const theme = pickTheme(company);
  const rows = useMemo(
    () =>
      (Array.isArray(cart?.orderProducts) ? cart.orderProducts : []).filter(Boolean),
    [cart?.orderProducts],
  );
  const itemsCount = useMemo(
    () => rows.reduce((sum, row) => sum + Number(row?.quantity || 0), 0),
    [rows],
  );
  const total = Number(cart?.price || 0);
  const visibleRows = rows.slice(0, 6);

  return (
    <View
      style={cartAsidePanelStyle({
        theme,
      })}>
      <View style={cartAsideHeaderStyle}>
        <View>
          <Text
            style={cartAsideTitleStyle({
              theme,
            })}>
            Seu pedido
          </Text>
          <Text
            style={cartAsideHintStyle({
              theme,
            })}>
            Revise o resumo sem sair do catalogo.
          </Text>
        </View>

        <Text
          style={cartAsideCountStyle({
            theme,
          })}>
          {itemsCount}
        </Text>
      </View>

      <View style={cartAsideBodyStyle}>
        {visibleRows.length === 0 ? (
          <View
            style={cartAsideEmptyStyle({
              theme,
            })}>
            <Text
              style={cartAsideEmptyTitleStyle({
                theme,
              })}>
              Seu carrinho ainda esta vazio
            </Text>
            <Text
              style={cartAsideHintStyle({
                theme,
              })}>
              Escolha os itens do cardapio para revisar o pedido aqui.
            </Text>
          </View>
        ) : (
          <View style={cartAsideListStyle}>
            {visibleRows.map(row => {
              const rowId = String(row?.id || row?.['@id'] || row?.product?.id || '');
              const rowTotal = Number(
                row?.total ?? Number(row?.quantity || 0) * Number(row?.price || 0),
              );

              return (
                <View
                  key={rowId}
                  style={cartAsideRowStyle({
                    theme,
                  })}>
                  <Text
                    numberOfLines={2}
                    style={cartAsideRowNameStyle({
                      theme,
                    })}>
                    {row?.product?.product || 'Item'}
                  </Text>
                  <Text
                    style={cartAsideRowMetaStyle({
                      theme,
                    })}>
                    {Number(row?.quantity || 0)} x {formatMoney(row?.price)}
                  </Text>
                  <Text
                    style={cartAsideRowMetaStyle({
                      theme,
                    })}>
                    {formatMoney(rowTotal)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={cartAsideFooterStyle}>
        <View>
          <Text
            style={cartAsideTotalLabelStyle({
              theme,
            })}>
            Total atual
          </Text>
          <Text
            style={cartAsideTotalValueStyle({
              theme,
            })}>
            {formatMoney(total)}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onOpenCart}
          style={cartAsideButtonStyle({
            disabled: visibleRows.length === 0,
            theme,
          })}>
          <Text
            style={cartAsideButtonTextStyle({
              disabled: visibleRows.length === 0,
              theme,
            })}>
            Ver carrinho
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
