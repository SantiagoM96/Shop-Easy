const deleteCartButton = document.getElementById('deleteCartButton')
const productsContainer = document.querySelector('.productsContainer')
const checkoutButton = document.getElementById('checkoutButton')

if (deleteCartButton && checkoutButton) {
    deleteCartButton.addEventListener('click', async (e) => {
        e.preventDefault()
        const cid = e.target.getAttribute('data-cart-id');
        const response = await fetch(`/api/carts/${cid}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            Swal.fire({
                title: 'Success',
                text: 'Cart deleted successfully',
                icon: 'success'
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Error when deleting cart',
                icon: 'error',
            });
        }

        productsContainer.innerHTML = '<h1>Cart Empty</h1>'

    })

    checkoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const cid = e.target.getAttribute('data-cart-id');
        const response = await fetch('/api/payments/payment-intents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json()

        if (response.ok) {
            localStorage.setItem('paymentIntentId', result.payload.id);
            window.location.href = `/carts/${cid}/checkout`
        } else {
            Swal.fire({
                title: 'Error',
                text: `${result.detail}`,
                icon: 'error',
            });
        }
    });
}