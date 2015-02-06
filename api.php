<?php

init();

/**
 * Main script body. Makes different calls depending on input params
 * Note, we're relying on the API to validate input
 */
function init()
{
    $output = '';

    $command = $_GET['command'];
    switch (strtolower($command)) {
        case 'authenticate':
            $user = $_GET['user'];
            $pass = $_GET['pass'];
            $output = authenticate($user, $pass);
            break;

        case 'get':
            $authToken = $_GET['authToken'];
            $output = getTransactions($authToken);
            break;

        case 'createtransaction':
            $authToken = $_GET['authToken'];
            $date = $_GET['date'];
            $merchant = $_GET['merchant'];
            $amount = $_GET['amount'];
            $output = createTransaction($authToken, $date, $merchant, $amount);
            break;

        default:
            // Send a page not found and equivalent JSON if a proper command was not issued
            http_response_code(404);
            print json_encode(['jsonCode' => 404]);
            break;
    }

    print $output;
}

/**
 * Authenticate with the expensify API
 *
 * @param $user
 * @param $pass
 *
 * @return string
 */
function authenticate($user, $pass)
{
    $url = "https://api.expensify.com?command=Authenticate&partnerName=applicant&partnerPassword=d7c3119c6cdab02d68d9&partnerUserID=$user&partnerUserSecret=$pass";

    return makeCall($url);
}

/**
 * Get list of all transactions on the account
 *
 * @param $authToken
 *
 * @return string
 */
function getTransactions($authToken)
{
    $url = "https://api.expensify.com?command=Get&authToken=$authToken&returnValueList=transactionList";

    return makeCall($url);
}

/**
 * @param $authToken
 * @param $date
 * @param $merchant
 * @param $amount
 *
 * @return string
 */
function createTransaction($authToken, $date, $merchant, $amount)
{
    $url = "https://api.expensify.com?command=CreateTransaction&authToken=$authToken&created=$date&amount=$amount&merchant=$merchant";

    return makeCall($url);
}

/**
 * Make a CURL call to a URL
 *
 * @param $url
 *
 * @return string
 */
function makeCall($url)
{
    $headers = [
        'Accept: application/json',
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    return curl_exec($ch);
}
