const socket = io()
const productList = document.getElementById('productos')
const addProductForm = document.getElementById('add-product-form')
const addProductButton = document.getElementById('addProductButton')
const tbody = productList.querySelector('tbody');

socket.on('newProduct', (product) => {

  const parsedProduct = JSON.parse(product);

  const newRow = document.createElement('tr');
  newRow.innerHTML = `
  <td>${parsedProduct._id}</td>
  <td><input type="text" name="title" value="${parsedProduct.title}" contenteditable="true" /></td>
  <td><input type="text" name="description" value="${parsedProduct.description}" contenteditable="true" /></td>
  <td><input type="text" name="code" value="${parsedProduct.code}" contenteditable="true"  /></td>
  <td><input type="number" name="price" value="${parsedProduct.price}" contenteditable="true" /></td>
  <td><input type="text" name="status" value="${parsedProduct.status}" contenteditable="true"  /></td>
  <td><input type="number" name="stock" value="${parsedProduct.stock}" contenteditable="true"  /></td>
  <td><input type="text" name="category" value="${parsedProduct.category}" contenteditable="true" /></td>
  <td>
    <button class="editButton" onclick="updateProduct('${parsedProduct._id}')">Edit</button>
  </td>
  <td>
    <button class="deleteButton" onclick="deleteProduct('${parsedProduct._id}')">Delete</button>
  </td>
`;

  newRow.setAttribute('id', parsedProduct._id)
  newRow.setAttribute('data-user-id', parsedProduct.owner)
  if (tbody) {
    tbody.appendChild(newRow);
  }
});

addProductForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userId = addProductButton.getAttribute('data-user-id')

  const formData = new FormData(addProductForm);
  formData.append('userId', userId)

  const response = await fetch(`/api/products/${userId}`, {
    method: 'POST',
    body: formData
  });
  const data = await response.json()

  if (response.ok) {
    Swal.fire({
      title: 'Success',
      text: 'Product added successfully',
      icon: 'success'
    });
  } else {
    Swal.fire({
      title: 'Error',
      text: `${data.error}`,
      icon: 'error',
    });
  }
  addProductForm.reset();
})


socket.on('productDeleted', (productId) => {
  const productItem = document.getElementById(productId)
  if (productItem) {
    productItem.remove()
  }
});

const deleteProduct = async (productId, userId) => {
  const row = document.getElementById(productId);
  userId = row.getAttribute('data-user-id');
  const response = await fetch(`/api/products/${productId}`, {
    method: 'DELETE',
    body: JSON.stringify({
      userId
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json()

  if (response.ok) {
    Swal.fire({
      title: 'Success',
      text: 'Product deleted successfully',
      icon: 'success'
    });
  } else {
    Swal.fire({
      title: 'Error',
      text: `${data.error}`,
      icon: 'error',
    });
  }
}

const updateProduct = async (productId) => {
  const row = document.getElementById(productId);
  userId = row.getAttribute('data-user-id');

  const title = row.cells[1].querySelector("input").value;
  const description = row.cells[2].querySelector("input").value;
  const code = row.cells[3].querySelector("input").value;
  const price = row.cells[4].querySelector("input").value;
  const status = row.cells[5].querySelector("input").value;
  const stock = row.cells[6].querySelector("input").value;
  const category = row.cells[7].querySelector("input").value;

  const productData = {
    title: title,
    description: description,
    code: code,
    price: parseFloat(price),
    status: status,
    stock: parseInt(stock),
    category: category
  }

  const response = await fetch(`/api/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({
      productData,
      userId
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json()

  if (response.ok) {
    Swal.fire({
      title: 'Success',
      text: 'Product updated successfully',
      icon: 'success'
    });
  } else {
    Swal.fire({
      title: 'Error',
      text: `${data.error}`,
      icon: 'error',
    });
  }

};

socket.on('updateProductInView', product => {
  const row = document.getElementById(product._id);
  row.cells[1].querySelector("input").value = product.title;
  row.cells[2].querySelector("input").value = product.description;
  row.cells[3].querySelector("input").value = product.code;
  row.cells[4].querySelector("input").value = product.price;
  row.cells[5].querySelector("input").value = product.status;
  row.cells[6].querySelector("input").value = product.stock;
  row.cells[7].querySelector("input").value = product.category;
})

socket.on('notification', notif => {
  Swal.fire({
    text: notif.message,
    icon: notif.type,
    timer: 3000,
  });
})
