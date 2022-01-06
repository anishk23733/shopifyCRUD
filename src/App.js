import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Button, Paper } from '@mui/material';
import axios from 'axios';

import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';

import {CSVLink, CSVDownload} from 'react-csv';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

let endpoint = 'http://127.0.0.1:5000/';
const darkModeTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [open, setOpen] = React.useState(false);
  const [currItem, setCurrItem] = React.useState({});
  const [items, setItems] = React.useState([]);

  const getInventory = () => {
    axios({
      method: 'get',
      url: endpoint + 'get_items',
    }).then(function (response) {
        setItems(response.data.inventory);
      });
  }

  React.useEffect(() => {
    getInventory();
  }, []);

  const generateID = () => {
    return new Date().valueOf();
  }

  const handleOpen = (item) => {
    if (item) {
      setCurrItem(item);
    } else {
      resetCurrItem();
    }
    setOpen(true);
  };

  const resetCurrItem = () => {
    setCurrItem({
      _id: -1,
      name: '',
      description: '',
      quantity: '',
      price: '',
    });
  }

  const handleClose = () => {
    resetCurrItem();
    setOpen(false);
  };

  const handleSubmit = () => {
    let newList = [];
    if (currItem._id === -1) {
      newList = items;
      let newItem = {
        ...currItem,
        _id: generateID(),
      }
      axios({
        method: 'post',
        url: endpoint + 'create_item',
        data: newItem
      }).then(response => {
        setItems(response.data.inventory);
      });
    }
    else {
      let newItem = currItem;
      axios({
        method: 'post',
        url: endpoint + 'edit_item',
        data: newItem
      }).then(response => {
        setItems(response.data.inventory);
      });
    }
    setOpen(false);
    resetCurrItem();
  };

  const handleDelete = (selectedItem) => {
    axios({
      method: 'post',
      url: endpoint + 'delete_item',
      data: selectedItem
    }).then(response => {
      setItems(response.data.inventory);
    })
  };

  let headers = [
    { label: 'ID', key: '_id' },
    { label: 'Name', key: 'name' },
    { label: 'Description', key: 'description' },
    { label: 'Price', key: 'price' },
    { label: 'Quantity', key: 'quantity' },
    { label: 'Time Created', key: 'date_added' },
    { label: 'Last Updated', key: 'last_updated' },
  ];  
  
  return (
    <ThemeProvider theme={darkModeTheme}>
      <Container maxWidth="lg" className="App">
        <Box sx={{ m: 10 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Shopify Inventory Manager
        </Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen(null)}>
          Create New Item
        </Button>
        <CSVLink headers={headers} data={items} filename={"shopify_export.csv"} style={{textDecoration: 'none'}}><Button style={{ marginLeft: "1em" }} variant="contained" color="primary">
          Export CSV
        </Button></CSVLink>
        <Box sx={{ m: 2 }} />

        <Grid container spacing={2}>
          {items.map(item => (
            <Grid item xs={4}>
              <Card sx={{ minWidth: 275 }} style={{ height: "100%" }} key={item._id}>
                <CardContent>
                  <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    {item.date_added}
                  </Typography>
                  <Typography variant="h5" component="div">
                    {item.name}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Quantity: {item.quantity ? item.quantity : 0} | Price: ${item.price ? item.price : 0}
                  </Typography>
                  <Typography variant="body2">
                    {item.description} 
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => {handleOpen(item)}}>
                    Edit
                  </Button>
                  <Button size="small" onClick={() => {handleDelete(item)}}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}        
        </Grid>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{currItem._id === -1 ? "Add Inventory Item" : "Edit Inventory Item"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {currItem._id === -1 ? "Add a new item to the inventory." : "Edit selected inventory item."}
            </DialogContentText>
            <TextField autoFocus margin="dense" fullWidth variant="outlined"
              id="name"
              label="Name"
              value={currItem.name} 
              onChange={e => {
                const val = e.target.value;
                setCurrItem(prevState => {
                  return { ...prevState, name: val }
                });
              }}
            />
            <TextField autoFocus margin="dense" fullWidth variant="outlined"
              id="description"
              label="Description"
              value={currItem.description} 
              onChange={e => {
                const val = e.target.value;
                setCurrItem(prevState => {
                  return { ...prevState, description: val }
                });
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField autoFocus margin="dense" fullWidth variant="outlined"
                id="quantity"
                label="Quantity"
                value={currItem.quantity} 
                onChange={e => {
                  const val = e.target.value;
                  setCurrItem(prevState => {
                    return { ...prevState, quantity: val }
                  });
                }}/>
              </Grid>
              <Grid item xs={6}>
                <TextField autoFocus margin="dense" fullWidth variant="outlined"
                id="price"
                label="Price"
                value={currItem.price} 
                onChange={e => {
                  const val = e.target.value;
                  setCurrItem(prevState => {
                    return { ...prevState, price: val }
                  });
                }}/>
              </Grid>
            </Grid>

          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {currItem._id === -1 ? "Create" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
        <Box sx={{ m: 10 }} />
      </Container>
    </ThemeProvider>
  );
}

export default App;
