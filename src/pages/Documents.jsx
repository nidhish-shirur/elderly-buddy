import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Alert,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject
} from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { storage, db } from '../utils/firebase';

const Container = styled(Box)(({ theme }) => ({
  maxWidth: '100%',
  minHeight: '100vh',
  backgroundColor: '#F5F5F5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}));

const Header = styled(Box)(({ theme }) => ({
  backgroundColor: '#8B7355',
  color: 'white',
  padding: '16px',
  display: 'flex',
  alignItems: 'center',
  position: 'relative'
}));

const BackButton = styled(Button)(({ theme }) => ({
  color: 'white',
  minWidth: 'auto',
  padding: '8px',
  position: 'absolute',
  left: '8px'
}));

const Content = styled(Box)(({ theme }) => ({
  padding: '20px',
  maxWidth: '600px',
  margin: '0 auto'
}));

const DocumentCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '15px',
  padding: '15px',
  marginBottom: '15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    backgroundColor: '#F8F8F8'
  }
}));

const DocumentInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '15px'
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '8px'
}));

const UploadButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#8B7355',
  color: 'white',
  '&:hover': {
    backgroundColor: '#7A6548'
  }
}));

const HiddenInput = styled('input')({
  display: 'none'
});

const documentCategories = [
  'Identity Documents',
  'Medical Records',
  'Insurance Papers',
  'Prescriptions',
  'Other'
];

const Documents = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: '',
    category: 'Other',
    file: null
  });

  useEffect(() => {
    fetchDocuments();
  }, [currentUser]);

  const fetchDocuments = async () => {
    try {
      const q = query(
        collection(db, 'documents'),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const docs = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        docs.push({
          id: doc.id,
          ...data,
          date: data.timestamp?.toDate() || new Date()
        });
      }
      setDocuments(docs.sort((a, b) => b.date - a.date));
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewDocument(prev => ({
        ...prev,
        file,
        name: file.name.split('.')[0]
      }));
      setUploadDialogOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!newDocument.file || !newDocument.name.trim()) {
      setError('Please provide a document name');
      return;
    }

    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      console.log('Starting upload process...', newDocument);
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${newDocument.file.name}`;
      console.log('Generated filename:', fileName);
      
      const storageRef = ref(storage, `documents/${currentUser.uid}/${fileName}`);
      console.log('Storage reference created');
      
      const uploadTask = uploadBytesResumable(storageRef, newDocument.file);
      console.log('Upload task created');

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload progress:', progress);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error details:', error);
          setError(`Failed to upload document: ${error.message}`);
        },
        async () => {
          try {
            console.log('Upload completed, getting download URL...');
            const downloadURL = await getDownloadURL(storageRef);
            console.log('Got download URL:', downloadURL);

            console.log('Saving to Firestore...');
            const docRef = await addDoc(collection(db, 'documents'), {
              userId: currentUser.uid,
              name: newDocument.name,
              category: newDocument.category,
              fileName: fileName,
              fileUrl: downloadURL,
              timestamp: serverTimestamp(),
              size: newDocument.file.size,
              type: newDocument.file.type
            });
            console.log('Saved to Firestore with ID:', docRef.id);

            setSuccess('Document uploaded successfully');
            setUploadDialogOpen(false);
            setNewDocument({ name: '', category: 'Other', file: null });
            await fetchDocuments();
          } catch (err) {
            console.error('Error saving document metadata:', err);
            setError(`Failed to save document information: ${err.message}`);
          }
        }
      );
    } catch (err) {
      console.error('Upload setup error:', err);
      setError(`Failed to start upload: ${err.message}`);
    }
  };

  const handleDelete = async (document) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        // Delete from Storage
        const storageRef = ref(storage, `documents/${currentUser.uid}/${document.fileName}`);
        await deleteObject(storageRef);

        // Delete from Firestore
        await deleteDoc(doc(db, 'documents', document.id));

        setSuccess('Document deleted successfully');
        fetchDocuments();
      } catch (err) {
        console.error('Delete error:', err);
        setError('Failed to delete document');
      }
    }
  };

  const handleView = (document) => {
    window.open(document.fileUrl, '_blank');
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Typography variant="h6" sx={{ width: '100%', textAlign: 'center' }}>
            Documents
          </Typography>
        </Header>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
        </BackButton>
        <Typography variant="h6" sx={{ width: '100%', textAlign: 'center' }}>
          Documents
        </Typography>
      </Header>

      <Content>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {documents.length > 0 ? (
          documents.map((doc) => (
            <DocumentCard key={doc.id}>
              <DocumentInfo>
                <DescriptionIcon sx={{ color: '#8B7355' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: '#333' }}>
                    {doc.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                    {doc.category}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                    {formatDate(doc.date)} • {formatFileSize(doc.size)}
                  </Typography>
                </Box>
              </DocumentInfo>
              <ActionButtons>
                <IconButton 
                  onClick={() => handleView(doc)}
                  size="small"
                  title="View document"
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton 
                  onClick={() => handleDelete(doc)}
                  size="small"
                  title="Delete document"
                >
                  <DeleteIcon />
                </IconButton>
              </ActionButtons>
            </DocumentCard>
          ))
        ) : (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No documents uploaded yet
            </Typography>
          </Box>
        )}

        <HiddenInput
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />

        <UploadButton
          variant="contained"
          fullWidth
          startIcon={<UploadFileIcon />}
          onClick={() => fileInputRef.current.click()}
          sx={{ mt: 2 }}
        >
          Upload New Document
        </UploadButton>

        <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Document Name"
              fullWidth
              value={newDocument.name}
              onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              fullWidth
              label="Category"
              value={newDocument.category}
              onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value }))}
            >
              {documentCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" sx={{ mt: 1 }}>
                  Uploading: {Math.round(uploadProgress)}%
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} variant="contained">Upload</Button>
          </DialogActions>
        </Dialog>
      </Content>
    </Container>
  );
};

export default Documents; 