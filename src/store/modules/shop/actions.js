import { api } from "@controleonline/../../src/boot/api";

//This function get categories of products...
export function getProductCategories({ commit }, data) {

  const options = {
    method: 'GET',
  };

  return api.fetch('/product_categories', options)
    .then(response => response.json())
    .then(response => {
      return response['hydra:member'];
    })
}

//This function get products details...
export const getProductDetails = ({ commit }, { id, params }) => {
  const options = {
    method: 'GET',
    params: params
  };

  return api.fetch('/products/' + id , options)
    .then(response => response.json())
    .then(response => {

      return response;

    });
};

// //This function get products details...
// export function getProductDetails({ commit }, {id}) {

//   const options = {
//     method: 'GET'
//   };

//   return fetch(`/products/${id}`, options)
//     .then(response => response.json())
//     .then(data => {
//       return data;
//     })
//     .catch(e => {
//       return e.message;
//     });
// }

// /products?productType.id=106&productSubtype.id=107
export function getProductsInCategories({commit}, data) {

  let params = data.params ? data.params : {};

  const options = {
    method: 'GET',
    params: params
  }

  return api.fetch('/products', options)
  .then(response => response.json())
  .then(response => {
    return response['hydra:member'];
  })

}
