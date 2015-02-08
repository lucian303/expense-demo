<?php
/**
 * Local wrapper API layer script that wraps part of Expensify's remote API
 *
 * @author Lucian Hontau
 */
run();

/**
 * Main function. Makes different calls depending on input params
 * Note the API does input validation and will error out if the values are not correct
 * We just guarantee that each paramter has a value
 */
function run()
{
    header('Content-type: application/json');

    $command = getParam('command');
    switch (strtolower($command)) {
        case 'authenticate':
            $output = authenticate(getParam('email'), getParam('password'));
            break;

        case 'get':
            $output = getTransactions(getParam('authToken'));
            break;

        case 'createtransaction':
            $output = createTransaction(getParam('authToken'), getParam('date'), getParam('merchant'), getParam('amount'));
            break;

        default:
            // Send a page not found and equivalent JSON if a proper command was not issued
            http_response_code(404);
            print json_encode(['jsonCode' => 404]);
            exit;
    }

    $response = json_decode($output, true);
    if (isset($response['jsonCode'])) {
        http_response_code($response['jsonCode']);
    } else if (isset($response['httpCode'])) {
        http_response_code($response['httpCode']);
    } else {
        http_response_code(400); // bad request
    }

    print $output;
    exit;
}

/**
 * Get a GET parameter or show error if not found
 *
 * @param string $name
 *
 * @return mixed|null
 */
function getParam($name)
{
    if (isset($_GET[$name])) {
        return $_GET[$name];
    }

    // If param was not found, return a 400 (bad request)
    http_response_code(400);
    print json_encode([
        'jsonCode' => 400,
        'message' => "Parameter '$name' must be specified",
    ]);

    exit;
}

/**
 * Authenticate with the expensify API
 *
 * @param string $email
 * @param string $pass
 *
 * @return string
 */
function authenticate($email, $pass)
{
    $email = urlencode($email);
    $pass = urlencode($pass);

    // Normally we would store API keys outside the app in the environment and out of the repo
    $url = 'https://api.expensify.com?command=Authenticate&partnerName=applicant&' .
           "partnerPassword=d7c3119c6cdab02d68d9&partnerUserID=$email&partnerUserSecret=$pass";

    return makeCall($url);
}

/**
 * Get list of all transactions on the account
 *
 * @param string $authToken
 *
 * @return string
 */
function getTransactions($authToken)
{
    $authToken = urlencode($authToken);

    $url = "https://api.expensify.com?command=Get&authToken=$authToken&returnValueList=transactionList";

    return makeCall($url);
}

/**
 * Add a transaction through the API
 *
 * @param string $authToken
 * @param string $date
 * @param string $merchant
 * @param int $amount
 *
 * @return string
 */
function createTransaction($authToken, $date, $merchant, $amount)
{
    $authToken = urlencode($authToken);
    $date = urlencode($date);
    $amount = urlencode($amount);
    $merchant = urlencode($merchant);

    $url = "https://api.expensify.com?command=CreateTransaction&authToken=$authToken" .
            "&created=$date&amount=$amount&merchant=$merchant";

    return makeCall($url);
}

/**
 * Make a CURL call to a given URL
 *
 * @param string $url
 *
 * @return string
 */
function makeCall($url)
{
    $headers = ['Accept: application/json'];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    return curl_exec($ch);
}
