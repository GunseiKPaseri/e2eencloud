import { useState } from 'react';
import MFAList from './MFAList';
import TOTPAdder from './TOTPAdder';
import FIDO2Register from './FIDO2Register';
import MFACodeDialog from './MFACodeDialog';

function MFASetting() {
  const [pageReloader, setPageReloader] = useState<symbol>(Symbol('pageload'));
  return (
    <>
      <MFAList reloader={pageReloader} />
      <TOTPAdder onSuccess={() => setPageReloader(Symbol('reload'))} />
      <FIDO2Register onSuccess={() => setPageReloader(Symbol('reload'))} />
      <MFACodeDialog />
    </>
  );
}

export default MFASetting;
