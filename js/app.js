//const forwarderOrigin = 'http://localhost:9010'
//var Web3 = require("web3");
const web3 = new Web3(window.ethereum)


//Created check function to see if the MetaMask extension is installed
const isMetaMaskInstalled = () => {
  //Have to check the ethereum binding on the window object to see if it's installed
  const { ethereum } = window;
  return Boolean(ethereum && ethereum.isMetaMask);
};

// Dapp Status Section
const networkDiv = document.getElementById('network')
const chainIdDiv = document.getElementById('chainId')
const accountsDiv = document.getElementById('accounts')

//Basic Actions Section
const onboardButton = document.getElementById('connectButton');
const getAccountsButton = document.getElementById('getAccounts');
const getAccountsResult = document.getElementById('getAccountsResult');
const getAccountsBalance = document.getElementById('getAccountsBalance');

//Mint SEction
const mintButton = document.getElementById('mintButton')
const mintAmountinput = document.getElementById('mintAmountinput')

//Send Eth Section
const sendButton = document.getElementById('sendButton')
const recipientAddress = document.getElementById('recipientAddressinput')
const sendAmountinput = document.getElementById('sendAmountinput')


const initialize = () => {
  //You will start here 


  const MetaMaskClientCheck = () => {
    //Now we check to see if MetaMask is installed
    if (!isMetaMaskInstalled()) {
      //If it isn't installed we ask the user to click to install it
      onboardButton.innerText = 'Click here to install MetaMask!';
      //When the button is clicked we call this function
      //onboardButton.onclick = onClickInstall;
      //The button is now disabled
      //onboardButton.disabled = false;
    } else {
      //If it is installed we change our button text
      onboardButton.innerText = 'Connect';
      //When the button is clicked we call this function to connect the users MetaMask Wallet
      onboardButton.onclick = onClickConnect;
      //The button is now disabled
      onboardButton.disabled = false;
    }
  };

  /*/We create a new MetaMask onboarding object to use in our app
  const onboarding = new MetaMaskOnboarding({ forwarderOrigin });

  //This will start the onboarding proccess
  const onClickInstall = () => {
    onboardButton.innerText = 'Onboarding in progress';
    onboardButton.disabled = true;
    //On this object we have startOnboarding which will start the onboarding process for our end user
    onboarding.startOnboarding();
  };
*/
  const onClickConnect = async () => {
    try {
      // Will open the MetaMask UI
      // You should disable this button while the request is pending!
      await ethereum.request({ method: 'eth_requestAccounts' });
      onboardButton.disabled=true;
      onboardButton.innerText = "Connected";
    } catch (error) {
      console.error(error);
    }
  };

  MetaMaskClientCheck();
  
  //Eth_Accounts-getAccountsButton
  getAccountsButton.addEventListener('click', async () => {
    //we use eth_accounts because it returns a list of addresses owned by us.
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    //We take the first address in the array of addresses and display it
    getAccountsResult.innerHTML = accounts[0] || 'Not able to get accounts';

    //const bal = await ethereum.request({ method: 'eth_getBalance', params: [accounts[0], "latest"] });
    //getAccountsBalance.innerHTML = parseInt(bal,16)/Math.pow(10,18);
    const bal = web3.eth.getBalance(accounts[0], function(error, result){
      if(error){
          console.log("Error with address");
      }else{
        console.log(result)
        getAccountsBalance.innerHTML = result*Math.pow(10,-18);
      }
    });
   
  });

  /*** Sending ETH ***/
  sendButton.onclick = async () => {
    
    var address = recipientAddress.value;
    var amount = sendAmountinput.value*Math.pow(10,18); //in ETH

    if( address.length > 0 && amount > 0 ){
      
      const transactionParameters = {
        //nonce: '0x00', // ignored by MetaMask
        //gasPrice: '0x09184e72a000', // customizable by user during MetaMask confirmation.
        //gas: '0x2710', // customizable by user during MetaMask confirmation.
        to: address, // Required except during contract publications.
        from: ethereum.selectedAddress, // must match user's active address.
        value: amount.toString(16), // Only required to send ether to the recipient from the initiating external account.
        //data:
         // '0x7f7465737432000000000000000000000000000000000000000000000000000000600057', // Optional, but used for defining smart contract creation and interaction.
        //chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
      };
      
      // txHash is a hex string
      // As with any RPC call, it may throw an error
      try {
        const txHash = await ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        });
      } catch (error){
        console.log(`Error: ${error.message}`);
      }
    } else{
      console.log("Error no address no amount");
    }    
  }

  /*** Minting ***/
  mintButton.onclick = async () => {
    
    mintButton.disabled = true;
    var amount = mintAmountinput.value;
    const cost = amount * (0.05*Math.pow(10,18));
    const nft_address = "0x77041F704d3de5776873479e60f364aFD4A16f5a";
    console.log(amount)


    if( amount == parseInt(amount) && amount > 0 ){
      
      const encodedFunction = web3.eth.abi.encodeFunctionCall(
        {
          name: 'mint',
          type: 'function',
          "inputs": [
            {
              "internalType": "address",
              "name": "_to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_mintAmount",
              "type": "uint256"
            }
          ]
        }, [ethereum.selectedAddress, amount]);
      
      const transactionParameters = {
        to: nft_address,
        from: ethereum.selectedAddress,
        value: cost.toString(16),
        data: encodedFunction
      };              
      
      // txHash is a hex string
      // As with any RPC call, it may throw an error
      try {
        const txHash = await ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        });
      } catch (error){
        console.log(`Error: ${error.message}`);
      }
    } else{
      console.log("Error no address no amount");
    }    
    mintButton.disabled = false;
  }

  




}

window.addEventListener('DOMContentLoaded', initialize)
