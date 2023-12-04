const stripe = Stripe('pk_test_51OHEQcL5yhmfRCDnIJVEcALqA2dfhrTmoLRrWBFsI6e8Od5F7wHp7rq4xc9IyiDftRvjjuZJX7DJtZvUri6MYfH900s5geY9b0');
const savedPaymentIntentId = localStorage.getItem('paymentIntentId');
const paymentSubmitButton = document.getElementById('submit-payment');
const paymentFormElement = document.querySelector('.payment-form');
const stripeElements = stripe.elements();
const cardStripeElement = stripeElements.create('card', {
    hidePostalCode: true
});
cardStripeElement.mount('#card-element');

if (!savedPaymentIntentId) {
    Swal.fire({
        title: 'Error',
        text: 'Payment Intent ID not found',
        icon: 'error',
        willClose: () => {
            window.location.href = '/products';
        }
    });

}

cardStripeElement.on('change', (e) => {
    if (e.error) {
        Swal.fire({
            title: 'Error',
            text: `${e.error.message}`,
            icon: 'error',
        });
    } else {
        paymentSubmitButton.style.display = e.complete ? 'block' : 'none';
    }
});

paymentFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const response = await fetch('/api/payments/confirm-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentIntentId: savedPaymentIntentId }),
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.removeItem('paymentIntentId');
            paymentSubmitButton.disabled = true;
            Swal.fire({
                title: 'Payment Successful',
                text: 'The payment was successfully processed',
                icon: 'success',
                willClose: () => {
                    window.location.href = '/products';
                }
            });
        } else {
            Swal.fire({
                title: 'Error Processing Payment',
                text: `${result.detail}`,
                icon: 'error',
            });
        }
    } catch (error) {
        Swal.fire({
            title: 'Error Processing Payment',
            text: `${error}`,
            icon: 'error',
        });
    }
});

const cancelPaymentButton = document.getElementById('cancel-payment')
cancelPaymentButton.addEventListener('click', async (e) => {
    e.preventDefault()
    const response = await fetch('/api/payments/cancel-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId: savedPaymentIntentId }),
    });
    const data = await response.json()

    if (response.ok) {
        localStorage.removeItem('paymentIntentId');
        paymentSubmitButton.disabled = true;
        Swal.fire({
            title: 'Successful payment cancellation',
            text: 'The payment was successfully cancel',
            icon: 'success',
            willClose: () => {
                window.location.href = '/products';
            }
        });
    } else {
        Swal.fire({
            title: 'Error canceling payment',
            text: `${data.detail}`,
            icon: 'error',
        });
    }
})