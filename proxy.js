const { exec } = require('child_process');
const crypto = require('crypto');

const SECRET_KEY = crypto.randomBytes(32); 
const IV = crypto.randomBytes(16); 

function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encryptedData: encrypted, iv: IV.toString('hex') };
}

function sendEncryptedData(data) {
  const { encryptedData, iv } = encrypt(data);
  console.log(`Encrypted Data: ${encryptedData}`);
  console.log(`IV: ${iv}`);
}

async function getConnectionType() {
  return new Promise((resolve, reject) => {
    const command = `powershell -Command "Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Select-Object -First 1 | Select-Object -ExpandProperty Name"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(`Error getting connection type: ${err.message}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }

      const connectionType = stdout.trim();
      console.log(`Detected connection type: ${connectionType}`);
      resolve(connectionType);
    });
  });
}

async function changeDNS(dns1, dns2) {
  const connectionType = await getConnectionType();

  const command = `powershell -Command "Start-Process netsh -ArgumentList 'interface ip set dns \"${connectionType}\" static ${dns1} primary' -Verb runAs"`;
  const command2 = `powershell -Command "Start-Process netsh -ArgumentList 'interface ip add dns \"${connectionType}\" ${dns2} index=2' -Verb runAs"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error changing DNS: ${err.message}`);
      return;
    }
    console.log(`DNS set to ${dns1}`);
    if (stdout) {
      console.log(`stdout: ${stdout}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
  });

  exec(command2, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error adding secondary DNS: ${err.message}`);
      return;
    }
    console.log(`Secondary DNS set to ${dns2}`);
    if (stdout) {
      console.log(`stdout: ${stdout}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
  });
}

function startProxy() {
  const proxyServer = 'localhost';
  const proxyPort = 1080; 
  const proxyCommand = `set HTTP_PROXY=socks5://${proxyServer}:${proxyPort} && set HTTPS_PROXY=socks5://${proxyServer}:${proxyPort}`;
  
  exec(proxyCommand, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error setting proxy: ${err.message}`);
      return;
    }
    console.log(`Proxy set to ${proxyServer}:${proxyPort}`);
    if (stdout) {
      console.log(`stdout: ${stdout}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
  });
}

async function configureNetwork(dns1, dns2) {
  await changeDNS(dns1, dns2); 
  startProxy(); 
  sendEncryptedData('Sensitive Data Here');
}

async function revertNetwork(dns1, dns2) {

  const connectionType = await getConnectionType();

  const resetDNSCommand = `powershell -Command "Start-Process netsh -ArgumentList 'interface ip set dns \"${connectionType}\" static ${dns1} primary' -Verb runAs"`;
  const resetSecondaryDNSCommand = `powershell -Command "Start-Process netsh -ArgumentList 'interface ip set dns \"${connectionType}\" static ${dns2} index=2' -Verb runAs"`;

  const resetProxyCommand = `set HTTP_PROXY= && set HTTPS_PROXY=`;

  exec(resetDNSCommand, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error resetting DNS1: ${err.message}`);
      return;
    }
    console.log(`Primary DNS reverted to ${dns1}`);
    if (stdout) {
      console.log(`stdout: ${stdout}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
  });

  exec(resetSecondaryDNSCommand, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error resetting DNS2: ${err.message}`);
      return;
    }
    console.log(`Secondary DNS reverted to ${dns2}`);
    if (stdout) {
      console.log(`stdout: ${stdout}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
  });

  exec(resetProxyCommand, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error stopping proxy: ${err.message}`);
      return;
    }
    console.log(`Proxy stopped.`);
    if (stdout) {
      console.log(`stdout: ${stdout}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
  });
}



module.exports = { configureNetwork, revertNetwork };
