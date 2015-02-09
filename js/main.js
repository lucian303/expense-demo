/**
 * Expensify Demo Controller
 *
 * @author Lucian Hontau <lucian303@gmail.com>
 */
(function ($) {
    'use strict';

    var user = {
            authToken: null,
            email: null
        },
        spinner = '<img src="img/ajax-loader.gif" />',
        loginCallback,
        addTransactionCallback,
        HTTP_OK = 200;

    /**
     * Show a login message or error
     *
     * @param {string} message
     */
    function showLoginMessage(message) {
        $('#login-message').html(message);
    }

    /**
     * Show a message in the transactions area
     *
     * @param {string} message
     */
    function showGeneralMessage(message) {
        $('#general-message').html(message);
    }

    /**
     * Show information and error messages when adding a transaction
     *
     * @param {string} message
     */
    function showCreateTransactionMessage(message) {
        $('#add-transaction-message').html(message);
    }

    /**
     * Called if the "get" API command fails
     */
    function showCreateTansactionError() {
        showCreateTransactionMessage('There was a problem adding the transaction.');
    }

    /**
     * Called if the "authorize" API call fails
     */
    function showLoginError() {
        showLoginMessage('There was a problem logging in. Please check your username and password and try again.');
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
            // clear etransactions
            $('#transactions').hide();
            $('#transactions-body').html('');

            // show logged out panel
            $('#logged-in-aside').hide();
            $('#logged-out-aside').show();

            // clear / set messages
            showGeneralMessage('There are no transactions because you are currently not logged in.');
            showLoginMessage('');
            showCreateTransactionMessage('');
        }
    }

    /**
     * Format an amount given in cents into a dollar figure
     *
     * @param {number} amount
     * @return {string}
     */
    function formatCents(amount) {
        return '$' + (amount / 100).toFixed(2); // amount is stored in cents
    }

    /**
     * Show transactions in a table
     *
     * @param {Array} transactions
     */
    function showTransactions(transactions) {
        var tableRows = '',
            transactionsTable = $('#transactions'),
            transactionsTableBody = $('#transactions-body');

        transactionsTable.hide();
        transactionsTableBody.html(''); // clear transaction display

        transactions.forEach(function (value) {
            tableRows += '<tr><td>' + value.created + '</td><td>' + value.merchant + '</td><td>' +
                formatCents(value.amount) + '</td></tr>';
        });

        transactionsTableBody.html(tableRows);
        transactionsTable.show();
    }

    /**
     * Get transactions from API
     */
    function getTransactions() {
        var transactionUrl;

        if (user.authToken) {
            showGeneralMessage('Loading transactions ... ' + spinner);

            transactionUrl = 'api.php?command=get&authToken=' + encodeURIComponent(user.authToken);
            $.ajax(transactionUrl, {
                success: function (data) {
                    // Check authToken just in case the user logged out while we were waiting for the callback to fire
                    if (user.authToken) {
                        showGeneralMessage(''); // remove loading transactions message and spinner
                        showCreateTransactionMessage(''); // clear the adding transaction message and spinner

                        if (data.jsonCode && data.jsonCode === HTTP_OK) {
                            showTransactions(data.transactionList);
                        } else {
                            showGeneralMessage('Thre was a problem retrieving transactions.');
                        }
                    }
                },
                error: function () {
                    showGeneralMessage('Thre was a problem retrieving transactions.');
                },
                dataType: 'json'
            });
        }
    }

    /**
     * Login callback, attached to login button sets login cookies and internal user object
     */
    loginCallback = function () {
        var email = $('#login-email').val(),
            password = $('#login-password').val(),
            loginUrl = 'api.php?command=authenticate&email=' + encodeURIComponent(email) +
                '&password=' + encodeURIComponent(password);

        showLoginMessage(''); // clear any previous login messages

        if (!email || !password) {
            showLoginMessage('Both username and password must be specified.');
            return false;
        }

        showLoginMessage('Loggin in ... ' + spinner);

        $.ajax(loginUrl, {
            success: function (data) {
                if (data.jsonCode && data.jsonCode === HTTP_OK) {
                    $.cookie('authToken', data.authToken);
                    $.cookie('email', data.email);

                    user.authToken = data.authToken;
                    user.email = data.email;

                    checkAuth();
                    getTransactions();
                } else {
                    showLoginError();
                }
            },
            error: function () {
                showLoginError();
            },
            dataType: 'json'
        });

        return false;
    };

    /**
     * Callback for the add transaction button
     */
    addTransactionCallback = function () {
        var date = $('#add-transaction-date').val(),
            merchant = $('#add-transaction-merchant').val(),
            amount = $('#add-transaction-amount').val(),
            createTransactionUrl;

        // Check for some common errors
        if (isNaN(amount)) {
            showCreateTransactionMessage('Amount must be a number.');
            return false;
        }

        if (!date || !merchant || !amount) {
            showCreateTransactionMessage('Date, merchant, and amount must all be specified.');
            return false;
        }

        showCreateTransactionMessage('Adding transaction ... ' + spinner);

        createTransactionUrl = 'api.php?command=createTransaction&authToken=' + encodeURIComponent(user.authToken) +
            '&date=' + encodeURIComponent(date) +
            '&merchant=' + encodeURIComponent(merchant) +
            '&amount=' + encodeURIComponent(Number(amount).toFixed(2) * 100); // convert cents to dollars

        $.ajax(createTransactionUrl, {
            success: function (data) {
                // Check authToken just in case the user logged out while we were waiting for the callback to fire
                if (user.authToken) {
                    if (data.jsonCode && data.jsonCode === HTTP_OK) {
                        getTransactions();
                    } else {
                        showCreateTansactionError();
                    }
                }
            },
            error: function () {
                showCreateTansactionError();
            },
            dataType: 'json'
        });

        return false;
    };

    /**
     * Logout callback clears cookies and user object
     */
    $('#logout-button').on('click', function () {
        $.removeCookie('authToken');
        $.removeCookie('email');

        user.authToken = null;
        user.email = null;

        checkAuth();
        showLoginMessage('You have been logged out.');
    });

    /**
     * Initialize and run the application upon loading or reloading and attach event handlers
     */
    function run() {
        $('#login-form').on('submit', loginCallback);
        $('#add-transaction-form').on('submit', addTransactionCallback);

        // Start app
        checkAuth();
        getTransactions();
    }

    run();
}(jQuery));
