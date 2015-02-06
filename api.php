<?php

function authenticate($user, $pass)
{
    $url = "https://api.expensify.com?command=Authenticate&partnerName=applicant&partnerPassword=d7c3119c6cdab02d68d9&partnerUserID=$user&partnerUserSecret=$pass";

    return makeCall($url);
}

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

print authenticate('expensifytest@mailinator.com', 'hire_me');