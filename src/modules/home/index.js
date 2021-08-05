import {
  Button,
  Grid,
  makeStyles,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Card,
  TextField,
  withStyles
} from '@material-ui/core';
import { useMetaMask } from 'metamask-react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/reducers/auth';
import { buyToken, getAccounts, getBalanceOf } from '../shared/helper/contract';
import BackgroundImg from '../../assets/images/background1.jpg'

const CustomTextField = withStyles({
  root: {
    '& .MuiInputBase-root': {
      color: 'black'
    },
    '& label': {
      color: 'grey',
    },
    '& label.Mui-focused': {
      color: 'black',
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: 'grey',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: 'black',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'grey',
      },
      '&:hover fieldset': {
        borderColor: 'black',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'black',
      },
    },
  },
})(TextField);

export const Home = () => {
  const dispatch = useDispatch();
  const { connect, status, account } = useMetaMask();
  const connected = status === 'connected';
  const [accountAddress, setAccount] = useState('');
  const [accountBalance, setBalance] = useState(0);
  const styles = useStyles();

  useEffect(() => {
    if (account) {
      getBalanceOf(account).then(balance => {
        console.log(balance);
        setBalance(Number(balance));
      });
      setAccount(account.slice(0, 4) + '...' + account.slice(-4));
    } else {
      dispatch(
        setUser({
          address: null,
          balance: 0
        })
      );
      setAccount(null);
    }
  }, [dispatch, account]);

  const connectAccount = () => {
    if (connected) return;
    connect();
  };

  const buyTool = async () => {
    if (!connected) {
      alert('Please connect to your wallet address first!');
      return;
    }
    if (accountBalance < 1) {
      alert('You have insufficient funds(BNB)!');
      return;
    }
    const accounts = await getAccounts();
    console.log(accounts)
    const result = await buyToken(accounts[0], 10 ** 18);
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      direction="row"
      className={styles.cardMainRoot}>
      <img src={BackgroundImg} className={styles.backgroundImg}></img>
      <Grid item xs={8} md={6}>
        <Card className={styles.cardRoot}>
          <CardHeader
            title="Toolkit Purchase dApp"
            classes={{ title: styles.cardMainTitle }}
          />
          <CardContent style={{ paddingTop: 5 }}>
            <Typography variant="h5" component="h5" className={styles.cardSubTitle}>
              Balance: {accountBalance} $TOOL
            </Typography>
          </CardContent>
          <CardActions>
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="center"
              spacing={3}>
              <Grid item>
                <CustomTextField
                  label="Input affliate"
                  className={styles.affliate}
                  variant="outlined"
                  id="custom-css-standard-input"
                />
              </Grid>
              <Grid item>
                <Button className={styles.buyButton} onClick={buyTool}>
                  Buy 1 $TOOL (1BNB)
                </Button>
              </Grid>
              <Grid item>
                <Button className={styles.revealButton}>
                  Reveal Code
                </Button>
              </Grid>
              <Grid item>
                <Button className={styles.connectButton} onClick={connectAccount}>
                  {accountAddress || 'Connect to Wallet'}
                </Button>
              </Grid>
            </Grid>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme) => ({
  backgroundImg: {
    position: 'absolute',
    zIndex: -2,
    left: '50%',
    top: '50%',
    width: '100%',
    height: '100%',
    transform: 'translate(-50%, -50%)',
    objectFit: 'cover'
  },
  cardMainRoot: {
    margin: '50px 0px'
  },
  cardRoot: {
    color: 'black',
    padding: '50px 0px',
    boxShadow: '0 0 25px 0 rgb(0 0 0 / 10%)',
    transition: 'all 0.4s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative',

    "&:hover": {
      transform: 'translateY(-10px)'
    },
    "&::before": {
      content: '""',
      backgroundImage: 'linear-gradient(45deg, white, #d7e9fd)',
      backgroundSize: 'cover',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      position: 'absolute',
      opacity: 0.5,
      zIndex: -2,
    }
  },
  cardMainTitle: {
    fontWeight: 500,
    fontSize: '1.68rem',
    [theme.breakpoints.down("sm")]: {
      fontSize: '1rem'
    }
  },
  cardSubTitle: {
    fontWeight: 500,
    [theme.breakpoints.down("sm")]: {
      fontSize: '0.85rem'
    }
  },
  buyButton: {
    color: 'black',
    fontSize: '1rem',
    fontWeight: 400,
    width: 341,
    padding: '0.375rem 0.75rem',
    textTransform: 'none',
    backgroundImage: 'linear-gradient(45deg, #51fbff, #5baeff)',

    "&:hover": {
      opacity: 0.9
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: '0.8rem',
      width: 170
    }
  },
  revealButton: {
    color: 'black',
    fontSize: '1rem',
    fontWeight: 400,
    width: 341,
    padding: '0.375rem 0.75rem',
    textTransform: 'none',
    backgroundImage: 'linear-gradient(45deg, #ff9d0a, #ff6c00)',

    "&:hover": {
      opacity: 0.9
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: '0.8rem',
      width: 170
    }
  },
  connectButton: {
    fontWeight: 400,
    fontSize: '1rem',
    color: 'black',
    marginTop: 20,
    textTransform: 'none',
    backgroundImage: 'linear-gradient(45deg, #51fbff, #5baeff)',

    "&:hover": {
      opacity: 0.9
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: '0.8rem',
      marginTop: 15
    }
  },
  affliate: {
    color: 'black'
  }
}));

export default Home;
