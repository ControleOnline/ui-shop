## Escopo
- Modulo da loja online e experiencia cliente.
- Cobre vitrine, busca, categoria, produto, carrinho, checkout, pedidos, perfil e cartoes do cliente.

## Estado
- Este modulo tem implementacao ativa em `src/react` e deve constar em novos prompts.
- Se existir `src/vue`, ela e apenas legado e deve ser ignorada, salvo pedido explicito.

## Regras de pagamento
- O `/cart` do cliente deve trabalhar com o carrinho de venda canonico (`orderType = cart`).
- A tela de fidelidade deve ler pedidos `orderType = fidelity`; por padrao mostra apenas o cartao aberto atual e oferece acesso aos ultimos cartoes. Os carimbos sao pedidos `sale` pagos vinculados por `mainOrderId`.
- O cliente escolhe pagar online agora ou cobrar na entrega.
- O checkout do `SHOP` deve exigir endereco de entrega no carrinho antes de gerar cobranca ou confirmar pedido.
- O pagamento online atual do shop usa Asaas.
- O pagamento na entrega depende das configuracoes da empresa e dos devices remotos liberados; as opcoes devem refletir o meio real configurado (Pix, cartao, dinheiro etc.), nao um agrupamento generico.
- Se a entrega permitir dinheiro, o fluxo deve pedir a informacao de troco.
- O `SHOP` nao conclui pagamento em dinheiro. Ele apenas registra a escolha do cliente para cobrar na entrega e deixa a confirmacao final para um funcionario em `PDV` ou `MANAGER`.
- O catalogo mobile nao deve exibir secoes de categorias sem produtos carregados.
- A busca do shop e instantanea a partir de 3 caracteres e deve reutilizar os resultados do cardapio, sem botao separado de pesquisa.
- Quando o cliente ja tem enderecos salvos, o formulario de novo endereco deve abrir apenas por acao explicita em "Adicionar endereco".
- Produtos com grupos ou complementos devem abrir personalizacao antes de entrar no carrinho, mesmo que os grupos venham apenas do backend.
- O catalogo do shop deve preferir o endpoint agregado `products/shop-catalog` para evitar uma chamada de produtos por categoria.
- Estados de carregamento visiveis no shop devem usar skeletons, nao texto solto de carregamento.

## Quando usar
- Prompts sobre storefront, loja, catalogo, carrinho, checkout do cliente, pedidos do cliente, cartoes e experiencia do shop.

## Limites
- Nao mover para `ui-shop` regras operacionais de PDV que pertencem a `ui-orders`.
- Ao navegar para telas compartilhadas como `CustomizeScreen`, o shop deve enviar apenas ids e flags primitivas em params. Nao passar objetos do produto pela URL.
- A home do `SHOP` usa `theme.menus` vindo de `menus-people`; atalhos cliente-facing nao devem depender de configuracao de device.
