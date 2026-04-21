## Escopo
- Modulo da loja online e experiencia cliente.
- Cobre vitrine, busca, categoria, produto, carrinho, checkout, pedidos, perfil e cartoes do cliente.

## Estado
- Este modulo tem implementacao ativa em `src/react` e deve constar em novos prompts.
- Se existir `src/vue`, ela e apenas legado e deve ser ignorada, salvo pedido explicito.

## Regras de pagamento
- O cliente escolhe pagar online agora ou cobrar na entrega.
- O pagamento online atual do shop usa Asaas.
- O pagamento na entrega depende das configuracoes da empresa e dos devices remotos liberados.
- Se a entrega permitir dinheiro, o fluxo deve pedir a informacao de troco.
- O `SHOP` nao conclui pagamento em dinheiro. Ele apenas registra a escolha do cliente para cobrar na entrega e deixa a confirmacao final para um funcionario em `PDV` ou `MANAGER`.

## Quando usar
- Prompts sobre storefront, loja, catalogo, carrinho, checkout do cliente, pedidos do cliente, cartoes e experiencia do shop.

## Limites
- Nao mover para `ui-shop` regras operacionais de PDV que pertencem a `ui-orders`.
