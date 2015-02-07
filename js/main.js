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
     * Format an amount in cents into a dollar figure
     *
     * @param amount
     * @returns {string}
     */
    function formatCents(amount) {
        return '$' + (amount / 100).toFixed(2); // amount is stored in cents
    }

    /**
     * Show transactions in a table
     *
     * @param transactions
     */
    function showTransactions(transactions) {
        var tableRows = '',
            transactionsTable = $('#transactions'),
            transactionsTableBody = $('#transactions-body');

        transactionsTable.hide();
        transactionsTableBody.html(''); // clear transaction display

        transactions.forEach(function (value) {
            tableRows += '<tr><td>' + value.created +'</td><td>' + value.merchant + '</td><td>' + formatCents(value.amount) + '</td></tr>';
        });

        transactionsTableBody.html(tableRows);
        transactionsTable.show();
    }

    /**
     * Show a message in the transactions area
     *
     * @param message
     */
    function showGeneralMessage(message) {
        $('#general-message').html(message);
    }

    /**
     * Get transactions from API or show error message
     */
    function getTransactions() {
        var transactionUrl;

        if (user.authToken) {
            showGeneralMessage('Loading transactions ... <img src="img/ajax-loader.gif" />');

            transactionUrl = '/api.php?command=get&authToken=' + encodeURIComponent(user.authToken);
            $.getJSON(transactionUrl, function(data) {
                if (data.jsonCode && data.jsonCode === HTTP_OK) {
                    transactions = data.transactionList;
                    showTransactions(data.transactionList);
                }

                showGeneralMessage(''); // remove loading transactions message and spinner
                showCreateTransactionMessage(''); // clear the adding transaction message and spinner
            });
        } else {
            $('#general-message').html('There are no transactions because you are currently not logged in.');
        }
    }

    /**
     * Login callback, attached to login button sets cookies and internal user object
     */
    $('#login-button').on('click', function () {
        var email = $('#login-email').val(),
            password = $('#login-password').val(),
            loginUrl = '/api.php?command=authenticate&email=' + encodeURIComponent(email) +
                '&password=' + encodeURIComponent(password);

        showLoginMessage('');

        if (!email || !password) {
            showLoginMessage('Both username and password must be specified.');
            return;
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
     * Show information and error messages when adding a transaction
     *
     * @param message
     */
    function showCreateTransactionMessage(message) {
        $('#add-transaction-message').html(message);
    }

    /**
     * Callback for the add transaction button
     */
    $('#add-transaction-button').on('click', function () {
        var date = $('#add-transaction-date').val(),
            merchant = $('#add-transaction-merchant').val(),
            amount = $('#add-transaction-amount').val(),
            createTransactionUrl = '/api.php?command=createTransaction&authToken=' + encodeURIComponent(user.authToken) +
                '&date=' + encodeURIComponent(date) +
                '&merchant=' + encodeURIComponent(merchant) +
                '&amount=' + encodeURIComponent(Number(amount).toFixed(2) * 100); // supplied amount is in cents, not dollars

        showCreateTransactionMessage('Adding transaction ... <img src="img/ajax-loader.gif" />');

        if (!date || !merchant || !amount) {
            showCreateTransactionMessage('Date, merchant, and amount must all be specified.');
            return;
        }

        $.getJSON(createTransactionUrl, function (data) {
            if (data.jsonCode && data.jsonCode === HTTP_OK) {
                getTransactions();
            } else {
                showCreateTransactionMessage('There was a problem adding the transaction.');
            }
        });
    });

    /**
     * Logout callback clears cookies and user object
     */
    $('#logout-button').on('click', function () {
        $.removeCookie('authToken');
        $.removeCookie('email');

        user.authToken = null;
        user.email = null;

        checkAuth();
        getTransactions();
    });
}(jQuery));
