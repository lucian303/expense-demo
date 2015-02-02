<?php

function authenticate()
{
    $url = "https://api.expensify.com?command=Authenticate&partnerName=applicant&partnerPassword=d7c3119c6cdab02d68d9&partnerUserID=expensifytest@mailinator.com&partnerUserSecret=hire_me";

    $ch = curl_init();
    $headers = [
        'Accept: application/json',
    ];

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);

    return $response;
}

print authenticate();
