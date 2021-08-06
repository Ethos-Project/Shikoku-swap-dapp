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
import {
  buyToken,
  getBalanceOf,
  hasRevealed,
  revealCode,
  web3
} from '../shared/helper/contract';
import Web3 from 'web3';
import license from '../../assets/txts/license.txt';
import BackgroundImg from '../../assets/images/background1.jpg';
import BackgroundVideo from './components/Video/Video';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';
import { getRandomInt } from '../shared/helper/utils';

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
  const [balanceSpinner, setBalanceSpiner] = useState(false);
  const [secretButtonSpinner, setSecretButtonSpiner] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const styles = useStyles();

  useEffect(() => {
    if (account) {
      setBalanceSpiner(true);
      setAccount(account.slice(0, 4) + '...' + account.slice(-4));
      getBalanceOf(account).then(balance => {
        console.log(balance);
        setBalance(Number(balance));
        setBalanceSpiner(false);
      });
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
    setAlertMessage('');
  };

  const buyTool = async () => {
    if (!connected) {
      setAlertMessage('Please connect to your wallet address first!');
      return;
    }
    web3.setProvider(Web3.givenProvider);
    buyToken(account, 10 ** 18).then((result) => {
      getBalanceOf(account).then(balance => {
        console.log(balance);
        setBalance(Number(balance));
      });
    });
    setAlertMessage('');
  };

  const revealSecretCode = async () => {
    if (!connected) {
      setAlertMessage('Please connect to your wallet address first!');
      return;
    }
    const alreadyRevealed = await hasRevealed(account);
    console.log(alreadyRevealed)
    if (alreadyRevealed) {
      setAlertMessage(
        `Already revealed the secret code for your current account. 
        Can't reveal another code for the same account!`);
      return;
    }
    if (accountBalance < 1) {
      setAlertMessage(
        `It looks like you don't have enough $TOOL(at least 1) in your wallet to access our group!`);
      return;
    }
    setSecretButtonSpiner(true);
    try {
      const revealResult = await revealCode(account);
    } catch {
      setAlertMessage('');
      setSecretButtonSpiner(false);
      return;
    }
    const checkedValue = await hasRevealed(account)

    if (checkedValue) {
      let licenseText = await fetch(license);
      licenseText = await licenseText.text();
      licenseText = licenseText.split(/\r?\n/);
      const rand = getRandomInt(0, licenseText.length);
      setSecretCode(licenseText[rand]);
      setAlertMessage('');
    } else {
      setAlertMessage(`Revealing secret code is failed for some reason!`);
    }
    setSecretButtonSpiner(false);
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      direction="row"
      className={styles.cardMainRoot}>
      <BackgroundVideo></BackgroundVideo>
      {/* <img src={BackgroundImg} className={styles.backgroundImg}></img> */}
      <Grid item xs={8} md={6}>
        <Card className={styles.cardRoot}>
          {alertMessage &&
            <Alert
              variant="filled"
              severity="error"
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              {alertMessage}
            </Alert>
          }
          <CardHeader
            title="Toolkit Purchase dApp"
            classes={{ title: styles.cardMainTitle }}
          />
          <CardContent style={{ paddingTop: 5 }}>
            {balanceSpinner ? <CircularProgress style={{ marginBottom: -14.5 }}></CircularProgress> :
              <Typography variant="h5" component="h5" className={styles.cardSubTitle}>
                Balance: {accountBalance} $TOOL
              </Typography>
            }
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
                {secretCode ?
                  <h2 className={styles.realSecretCode}>
                    Your secret code is:
                    <p className={styles.realSecretCodeBody}>
                      {secretCode}
                    </p>
                  </h2> :
                  <div className={styles.secretButton}>
                    <Button
                      className={styles.revealButton}
                      onClick={revealSecretCode}
                      disabled={secretButtonSpinner}>
                      Reveal Code
                    </Button>
                    {secretButtonSpinner && <CircularProgress size={24} className={styles.secretSpinner} />}
                  </div>
                }
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
  },
  secretButton: {
    position: 'relative'
  },
  secretSpinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  realSecretCode: {
    fontWeight: 500,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  realSecretCodeBody: {
    color: 'red',
    margin: '0px 6px'
  }
}));

export default Home;
