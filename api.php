<?php

init();

/**
 * Main script body. Makes different calls depending on input params
 * Note, we're relying on the API to validate input
 */
function init()
{
    $command = getParam('command');
    switch (strtolower($command)) {
        case 'authenticate':
            $email = getParam('email');
            $password = getParam('password');
            $output = authenticate($email, $password);
            break;

        case 'get':
            $authToken = getParam('authToken');
            $output = getTransactions($authToken);
            break;

        case 'createtransaction':
            $authToken = getParam('authToken');
            $date = getParam('date');
            $merchant = getParam('merchant');
            $amount = getParam('amount');
            $output = createTransaction($authToken, $date, $merchant, $amount);
            break;

        default:
            // Send a page not found and equivalent JSON if a proper command was not issued
            http_response_code(404);
            print json_encode(['jsonCode' => 404]);
            die;
            break; // not necessary but left here in case the block is changed not to die in the future
    }

    print $output;
}

/**
 * Return an error message if a parameter is not specified
 *
 * @param $name
 */
function missingParameter($name)
{
    http_response_code(400);
    print json_encode([
        'jsonCode' => 400,
        'message' => "Parameter '$name' must be specified",
    ]);

    die;
}

/**
 * Get a GET parameter or show error if not found
 *
 * @param $name
 *
 * @return mixed|null
 */
function getParam($name)
{
    if (isset($_GET[$name])) {
        return $_GET[$name];
    }

    missingParameter($name);
}

/**
 * Authenticate with the expensify API
 *
 * @param $email
 * @param $pass
 *
 * @return string
 */
function authenticate($email, $pass)
{
    // Normally we would store API keys outside the app in the environment and out of the repo
    $url = "https://api.expensify.com?command=Authenticate&partnerName=applicant&partnerPassword=d7c3119c6cdab02d68d9&partnerUserID=$email&partnerUserSecret=$pass";

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
