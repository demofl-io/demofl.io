// js/popup/index.js
import { loadDemoList } from './list.js';
import { initializeImport } from './import.js';
import ExtPay from 'extpay';
import { AuthService } from '../auth';

const authService = new AuthService();
var extpay = ExtPay('abobjbfojjkoonmfffjppmkobmbcebdj'); // Careful! See note below

extpay.getUser().then(user => {
    console.log(user)
})

const trialDays = 30;


document.querySelector('#login').addEventListener('click', extpay.openLoginPage);
document.querySelector('#paynow').addEventListener('click', extpay.openPaymentPage);
document.querySelector('#trial').addEventListener('click', func => {
    extpay.openTrialPage("Enter an email to start your *"+trialDays+"-days* free trial");
});





document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await authService.isAuthenticated();

    // demofl.io cloud for the team plan
    if (isAuthenticated) {
        document.querySelector('#payheader').innerHTML = 'Welcome to the cloud  🎉';
        // Add sign out button
        document.querySelector('#payheader').innerHTML += ' <button id="signout" class="btn btn-link">Sign out</button>';
        // Add sign out handler
        document.querySelector('#signout').addEventListener('click', async () => {
            await authService.signOut();
            window.location.reload();
        });
        loadDemoList();
        initializeImport();
    
    } else {
        // always show cloud login button
        showLoginButton();

        // here we use ExtPay to check if the user is logged in and paid for the personnal plan
        extpay.getUser().then(user => {
            if (user.email) {
                document.querySelector('#login').remove();
            }
            if (user.paid) {
                document.querySelector('#payheader').innerHTML = 'Welcome ' + user.email + ' 🎉';
    
                document.querySelector('#payheader').innerHTML += ' <button id="preferences" class="btn btn-link">Manage your subscription</button>';
                document.querySelector('#payheader').innerHTML += ' <button id="extpay-signout" class="btn btn-link">Sign out</button>';
    
                document.querySelector('#preferences').addEventListener('click', extpay.openPaymentPage);
                document.querySelector('#extpay-signout').addEventListener('click', () => {
                    // Clear ExtPay user data from storage
                    chrome.storage.sync.remove(['extensionpay_api_key', 'extensionpay_user'], () => {
                        window.location.reload();
                    });
                });
            } else {
                const now = new Date();
                const sevenDays = 1000 * 60 * 60 * 24 * trialDays // in milliseconds
                if (user.trialStartedAt && (now - user.trialStartedAt) < sevenDays) {
                    document.querySelector('#payheader').innerHTML = 'Welcome ' + user.email + ' . Your trial ends in ' + Math.floor((sevenDays - (now - user.trialStartedAt)) / (1000 * 60 * 60 * 24)) + ' days';
    
                    // add html preferences and signout buttons to payheader
                    document.querySelector('#payheader').innerHTML += ' - <button id="preferences" class="btn btn-link">Manage your subscription</button>';
                    document.querySelector('#payheader').innerHTML += ' <button id="extpay-signout" class="btn btn-link">Sign out</button>';
    
                    document.querySelector('#preferences').addEventListener('click', extpay.openPaymentPage);

                    document.querySelector('#extpay-signout').addEventListener('click', () => {
                        // Clear ExtPay user data from storage
                        chrome.storage.sync.remove(['extensionpay_api_key', 'extensionpay_user'], () => {
                            window.location.reload();
                        });
                    });
                } else {
                    // user's trial is not active
                    document.querySelector('#demoflio').remove();
                    return;
                }
    
            }
            loadDemoList();
            initializeImport();
        }).catch(err => {
            document.querySelector('p').innerHTML = "Error fetching data :( Check that your ExtensionPay id is correct and you're connected to the internet"
        });
    }


});

function showLoginButton() {
    const loginButton = document.createElement('button');
    loginButton.className = 'btn btn-primary';
    loginButton.textContent = 'Login with Demofl.io Cloud (coming soon)';
    loginButton.disabled = true;
    loginButton.addEventListener('click', async () => {
        const authUrl = await authService.initiateLogin();
        chrome.windows.create({
            url: authUrl,
            type: 'popup',
            width: 600,
            height: 700
        });
    });

    document.querySelector('#login-container').appendChild(loginButton);
}

// Listen for authentication success
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'AUTH_SUCCESS') {
        window.location.reload();
    }
});

