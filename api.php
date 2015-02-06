<?php

init();

/**
 * Main script body. Makes different calls depending on input params
 */
function init()
{
    $output = '';

    $command = $_GET['command'];
    switch ($command) {
        case 'Authenticate':
            $user = $_GET['user'];
            $pass = $_GET['pass'];
            $output = authenticate($user, $pass);
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
 * @return mixed
 */
function authenticate($user, $pass)
{
    $url = "https://api.expensify.com?command=Authenticate&partnerName=applicant&partnerPassword=d7c3119c6cdab02d68d9&partnerUserID=$user&partnerUserSecret=$pass";

    return makeCall($url);
}

/**
 * Make a CURL call to a URL
 * @param $url
 *
 * @return mixed
 */
function makeCall($url)
{
    $headers = [
        'Accept: application/json',
        'Content-Type: application/json',
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    return curl_exec($ch);
}
