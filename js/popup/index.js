// js/popup/index.js
import { loadDemoList } from './list.js';
import { initializeImport } from './import.js';
import ExtPay from 'extpay';
var extpay = ExtPay('abobjbfojjkoonmfffjppmkobmbcebdj'); // Careful! See note below

extpay.getUser().then(user => {
	console.log(user)
})



document.querySelector('#login').addEventListener('click', extpay.openLoginPage);
document.querySelector('#paynow').addEventListener('click', extpay.openPaymentPage);
document.querySelector('#trial').addEventListener('click', func => {
  extpay.openTrialPage("Enter an email to start your *7-day* free trial");
});





document.addEventListener('DOMContentLoaded', () => {


  extpay.getUser().then(user => {
    if (user.email) {
      document.querySelector('#login').remove();
    }
      if (user.paid) {
          document.querySelector('#payheader').innerHTML = 'Welcome '+user.email+' 🎉';
  
          document.querySelector('#payheader').innerHTML = document.querySelector('#payheader').innerHTML + ' - <button  id="preferences"  class="btn btn-link">Manage your subscription</button>';
  
          document.querySelector('#preferences').addEventListener('click', extpay.openPaymentPage);
      } else {
        const now = new Date();
        const sevenDays = 1000*60*60*24*7 // in milliseconds
        if (user.trialStartedAt && (now - user.trialStartedAt) < sevenDays) {
           document.querySelector('#payheader').innerHTML = 'Welcome '+user.email+' . Your trial ends in '+Math.floor((sevenDays - (now - user.trialStartedAt))/(1000*60*60*24))+' days';
  
           // add html preferences button to payheader :
  
           document.querySelector('#payheader').innerHTML = document.querySelector('#payheader').innerHTML + ' - <button id="preferences"  class="btn btn-link">Manage your subscription</button>';
  
           document.querySelector('#preferences').addEventListener('click', extpay.openPaymentPage);
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
  })



});

document.getElementById('configLogos').addEventListener('click', () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL('html/config.html')
    });
});