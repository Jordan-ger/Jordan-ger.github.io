const fetch = require('node-fetch');
const uuid = require('uuid');

exports.handler = async function(event, context) {
    const { login, amount } = JSON.parse(event.body);
    const commission = 0.05;
    const total_amount = (parseFloat(amount) * (1 + commission)).toFixed(2);
    const idempotence_key = uuid.v4();

    const headers = {
        "Content-Type": "application/json",
        "Authorization": "Basic " + Buffer.from("480087:test_BP_lf8EOC7UFMN2wliQGznyLKSxElAf0Yi_sF_FwUUc").toString('base64'),
        "Idempotence-Key": idempotence_key
    };

    const payment_data = {
        "amount": {
            "value": total_amount,
            "currency": "RUB"
        },
        "confirmation": {
            "type": "redirect",
            "return_url": "https://fenixmiks.online/return"
        },
        "capture": true,
        "description": `Пополнение Steam для ${login}`
    };

    try {
        const response = await fetch("https://api.yookassa.ru/v3/payments", {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payment_data)
        });

        const data = await response.json();
        
        if (response.status === 200) {
            return {
                statusCode: 200,
                body: JSON.stringify({ payment_url: data.confirmation.confirmation_url })
            };
        } else {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: data })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
