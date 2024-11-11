import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';

export async function writeNdef(userId : string) {
    NfcManager.start();
    let result = false;
  
    try {
      // STEP 1
      await NfcManager.requestTechnology(NfcTech.Ndef);
  
      const bytes = Ndef.encodeMessage([Ndef.uriRecord(`https://www.google.com/search?q=${encodeURIComponent(userId)}`)]);
  
      if (bytes) {
        await NfcManager.ndefHandler // STEP 2
          .writeNdefMessage(bytes); // STEP 3
        result = true;
      }
    } catch (ex) {
      console.warn(ex);
    } finally {
      // STEP 4
      NfcManager.cancelTechnologyRequest();
    }
  
    return result;
  }

export async function readNdef() {
    NfcManager.start();
    let tagFound = null;
    let userId = '';
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);
  
      const tag = await NfcManager.ndefHandler // STEP 1
        .getNdefMessage();
  
      if (tag) {
        tagFound = tag;
      }
        userId = Ndef.uri.decodePayload(tagFound.ndefMessage[0].payload).substring(userId.indexOf('=') + 1)
      if (tagFound?.ndefMessage[0].payload) {
        
      }
    } catch (ex) {
      console.warn(ex);
    } finally {
      NfcManager.cancelTechnologyRequest();
    }
  
    return userId;
}
