import React, { useState } from 'react';
import { useZxing } from 'react-zxing';
import { Box, Button, Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

const ScannerContainer = styled(Box)({
  width: '100%',
  maxWidth: '500px',
  margin: '0 auto',
  '& video': {
    width: '100%',
    borderRadius: '12px'
  }
});

const ScanButton = styled(Button)({
  backgroundColor: '#4A6FA5',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '16px',
  '&:hover': {
    backgroundColor: '#3A5982'
  }
});

const BarcodeScanner = ({ onScan }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { ref } = useZxing({
    onDecodeResult: (result) => {
      onScan(result.getText());
      setIsOpen(false);
    },
  });

  return (
    <>
      <ScanButton
        startIcon={<QrCodeScannerIcon />}
        onClick={() => setIsOpen(true)}
      >
        Scan Medication Barcode
      </ScanButton>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Scan Medication Barcode</Typography>
            <IconButton onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <ScannerContainer>
            <video ref={ref} />
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: '#666' }}>
              Position the barcode within the camera view
            </Typography>
          </ScannerContainer>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BarcodeScanner; 