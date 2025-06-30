import React, { useState, useEffect } from 'react';
import { useZxing } from 'react-zxing';
import { Box, Button, Dialog, DialogTitle, DialogContent, IconButton, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const ScannerContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '500px',
  margin: '0 auto',
  position: 'relative',
  '& video': {
    width: '100%',
    borderRadius: '12px',
    border: '2px solid #E0E0E0',
  },
}));

const ScanButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#4A6FA5',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '16px',
  '&:hover': {
    backgroundColor: '#3A5982',
  },
}));

const FeedbackBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
  color: '#2C3E50',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: '12px',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
}));

const BarcodeScanner = ({ onScan }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const { ref, loading } = useZxing({
    onDecodeResult: (result) => {
      const barcodeText = result.getText();
      setScanResult(barcodeText);
      onScan(barcodeText); // Pass the result to the parent
      setTimeout(() => setIsOpen(false), 1000); // Close after a brief delay
    },
    onError: (error) => {
      setError('Failed to access camera or decode barcode. Please ensure camera permissions are granted.');
      console.error('Zxing error:', error);
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setScanResult(null);
      setError(null);
    }
  }, [isOpen]);

  return (
    <>
      <ScanButton
        startIcon={<QrCodeScannerIcon />}
        onClick={() => setIsOpen(true)}
        disabled={loading}
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
            {loading && (
              <FeedbackBox>
                <CircularProgress size={40} />
                <Typography variant="body2">Initializing camera...</Typography>
              </FeedbackBox>
            )}
            {scanResult && !loading && (
              <FeedbackBox>
                <CheckCircleIcon color="success" sx={{ fontSize: '40px' }} />
                <Typography variant="body2">Scanned: {scanResult}</Typography>
              </FeedbackBox>
            )}
            {error && !loading && !scanResult && (
              <FeedbackBox>
                <ErrorIcon color="error" sx={{ fontSize: '40px' }} />
                <Typography variant="body2">{error}</Typography>
              </FeedbackBox>
            )}
            {!loading && !scanResult && !error && (
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: '#666' }}>
                Position the barcode within the camera view
              </Typography>
            )}
          </ScannerContainer>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BarcodeScanner;