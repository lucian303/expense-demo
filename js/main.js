(function ($) {
    'use strict';

    var user = {
            authToken: null,
            email: null
        },
        transactions,
        HTTP_OK = 200;

    init();

    /**
     * Initialize application upon load/reload
     */
    function init() {
        checkAuth();
        getTransactions();
    }

    /**
     * Show a login message or error
     *
     * @param message
     */
    function showLoginMessage(message) {
        $('#login-message').text(message);
    }

    /**
     * Check authentication cookie and show logged in or logged out view
     */
    function checkAuth() {
        var authToken,
            email;

        if (authToken = $.cookie('authToken')) {
            user.authToken = authToken;
            $('#logged-out-aside').hide();
            $('#logged-in-aside').show();

            // Save email in a cookie as well so we can display it later
            if (email = $.cookie('email')) {
                user.email = email;
                $('#logged-in-email').text(email);
            } else {
                $('#logged-in-email').text('');
            }
        } else {
            $('#logged-in-aside').hide();
            $('#logged-out-aside').show();
        }
    }

    /**
     * Show transactions in a table
     *
     * @param transactions
     */
    function showTransactions(transactions) {

    }

    /**
     * Get transactions from API or show error message
     */
    function getTransactions() {
        var transactionUrl;

        if (user.authToken) {
            $('#general-message').text('');

            transactionUrl = '/api.php?command=get&authToken=' + encodeURIComponent(user.authToken);
            $.getJSON(transactionUrl, function(data) {
                if (data.jsonCode && data.jsonCode === HTTP_OK) {
                    transactions = data.transactionList;
                    showTransactions(data.transactionList);
                }
            });
        } else {
            $('#general-message').text('There are no transactions because you are currently not logged in.');
        }
    }

    /**
     * Login callback, attached to login button sets cookies and internal user object
     */
    $('#login').on('click', function () {
        var email = $('#email').val(),
            password = $('#password').val(),
            loginUrl = '/api.php?command=authenticate&email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password);

        showLoginMessage('');

        if (!email || !password) {
            showLoginMessage('Both username and password must be specified.');
        }

        $.getJSON(loginUrl, function (data) {
            if (data.jsonCode && data.jsonCode === HTTP_OK) {
                $.cookie('authToken', data.authToken);
                $.cookie('email', data.email);

                user.authToken = data.authToken;
                user.email = data.email;

                checkAuth();
                getTransactions();
            } else {
                showLoginMessage('There was a problem logging in. Please check your username and password and try again.');
            }
        });
    });

    /**
     * Logout callback clears cookies and user object
     */
    $('#logout').on('click', function () {
        $.removeCookie('authToken');
        $.removeCookie('email');

        user.authToken = null;
        user.email = null;

        checkAuth();
        getTransactions();
    });
}(jQuery));
