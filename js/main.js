(function ($) {
    'use strict';

    var user = {
            authToken: null,
            email: null
        };

    init();

    /**
     * Initialize application upon load/reload
     */
    function init() {
        checkAuth();
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
     * Login callback, attached to login button sets cookies and internal user object
     */
    $('#login').on('click', function () {
        var username = $('#email').val(),
            password = $('#password').val(),
            loginUrl = '/api.php?command=authenticate&email=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password);

        showLoginMessage('');

        if (!username || !password) {
            showLoginMessage('Both username and password must be specified.');
        }

        $.getJSON(loginUrl, function (data) {
            if (data.jsonCode === 200) {
                $.cookie('authToken', data.authToken);
                $.cookie('email', data.email);

                user.authToken = data.authToken;
                user.email = data.email;

                checkAuth();
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
    });
}(jQuery));
