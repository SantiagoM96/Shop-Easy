const addToCartButton = document.querySelector('.addToCartButton');

addToCartButton.addEventListener('click', async (e) => {
    const cartId = e.target.getAttribute('data-cart-id');
    const productId = e.target.getAttribute('data-product-id');
    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: 'POST'
    });

    if (response.ok) {
        Swal.fire({
            title: 'Success',
            text: 'Product added to the cart successfully',
            icon: 'success'
        });
    } else {
        Swal.fire({
            title: 'Error',
            text: 'Error adding the product to the cart',
            icon: 'error',
        });
    }
});
