import {
  Button,
  Grid,
  makeStyles,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Card
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import BackgroundVideo from './components/Video/Video';
import { useMetaMask } from 'metamask-react';
import { getBalanceOf, transferToken, approveAmount, web3, sshibaDecimals, getCurrentBonusRatio, getUserDeposits } from '../shared/helper/contract';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../store/reducers/auth';
import CircularProgress from '@material-ui/core/CircularProgress';
import TwitterIcon from '@material-ui/icons/Twitter';
import TelegramIcon from '@material-ui/icons/Telegram';
import Link from '@material-ui/core/Link';

export const Home = () => {
  const dispatch = useDispatch();
  const styles = useStyles();

  const { connect, status, account } = useMetaMask();
  const connected = status === 'connected';
  const [username, setUsername] = useState('');

  const maxAmount = 2000000000;

  const [decimals, setDecimals] = useState(0);

  const [currentBonusRatio, setCurrentBonusRatio] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      getBalanceOf(account).then(async (balance) => {
        const decimals = await sshibaDecimals();
        const bounsRatio = await getCurrentBonusRatio();
        const deposits = await getUserDeposits(account);
        setDecimals(+decimals);
        setCurrentBonusRatio(+bounsRatio);

        dispatch(
          setUser({
            address: account.toLowerCase(),
            balance: +balance / 10 ** +decimals,
            deposits: +deposits
          })
        );
      }).catch(error => {
        console.log(error);
      });
    } else {
      dispatch(
        setUser({
          address: null,
          balance: 0,
          deposits: 0
        })
      );
    }

    if (account) {
      web3.eth.setProvider(Web3.givenProvider);
      setUsername(account.slice(0, 4) + '...' + account.slice(-4));
    } else {
      setUsername(null);
    }
  }, [dispatch, account]);

  const connectAccount = () => {
    if (connected) {
      return;
    }
    connect();
  };
  const user = useSelector(state => state.auth.user);

  const handleApproveAmount = () => {
    setLoading(true);
    approveAmount(account, web3.utils.toBN(maxAmount).mul(web3.utils.toBN(10 ** +decimals))).then((res) => {
      setLoading(false);
    }).catch((err) => {
      setLoading(false);
    });
  }

  const handleTransferToken = () => {
    setLoading(true);
    const amount = Math.min(maxAmount, +user.balance);
    const v = getDecimalAndInt(amount);
    const value = web3.utils.toBN(v.integer).mul(web3.utils.toBN(10 ** +(decimals - v.decimals)));
    transferToken(account, value).then(async (res) => {
      const balance = await getBalanceOf(account);
      const deposits = await getUserDeposits(account);
      setUser({balance, deposits});
      console.log(user);
      setLoading(false);
    }).catch((err) => {
      setLoading(false);
    });
  };
  const getDecimalAndInt = (balance) => {
    balance = `${balance}`;
    if (!balance.includes('.')) {
      return {
        decimals: 0,
        integer: balance
      };
    }
    return {
      decimals: balance.length - balance.indexOf('.') - 1,
      integer: balance.replace('.', '')
    }
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      direction="row"
      className={styles.cardMainRoot}>
      <BackgroundVideo></BackgroundVideo>
      <Grid item xs={11} md={6} sm={9}>
        <Card className={styles.cardRoot}>
          <CardHeader
            title="Migrate your SSHIBA to ETHOS"
            classes={{ title: styles.cardMainTitle }}
          />
          <CardContent className={styles.cardMainBody}>
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="center"
              spacing={3}>
              <Grid item className={styles.lineItem} md={7} sm={7}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Typography variant="h6" component="h6" className={styles.cardValue}>
                    Current Bonus%:
                  </Typography>
                  <Typography variant="h6" component="h6" className={styles.cardValue}>
                    {currentBonusRatio}%
                  </Typography>
                </Grid>
              </Grid>
              <Grid item className={styles.lineItem} md={7} sm={7}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Typography variant="h6" component="h6" className={styles.cardValue}>
                    SSHIBA Balance:
                  </Typography>
                  <Typography variant="h6" component="h6" className={styles.cardValue}>
                    {Number(user.balance).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item className={styles.lineItem} md={7} sm={7}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Typography variant="h6" component="h6" className={styles.cardValue}>
                    Max SSHIBA per Swap:
                  </Typography>
                  <Typography variant="h6" component="h6" className={styles.cardValue}>
                    {Number(maxAmount).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item className={styles.lineItem} md={7} sm={7}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Typography variant="h6" component="h6" className={styles.cardValue}>
                    SSHIBA Swapped:
                  </Typography>
                  <Typography variant="h6" component="h6" className={styles.cardValue}>
                    {Number(user.deposits).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={3}>
              <Grid item xs={6}>
                <Button variant="contained" className={styles.swapButton} onClick={connectAccount} disabled={connected}>
                  Connect
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" className={styles.swapButton} onClick={handleApproveAmount} disabled={loading}>
                  { loading ? <CircularProgress color="inherit" /> : 'Approve' }
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" className={styles.swapButton} onClick={handleTransferToken} disabled={loading} xs={12}>
                  { loading ? <CircularProgress color="inherit" /> : 'Swap' }
                </Button>
              </Grid>

              <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
                mt={10}>
                <Typography variant="h5" component="h5">
                  <Link href="https://t.me/TheEthosProject" target="_blank">
                    <TelegramIcon></TelegramIcon>
                  </Link>
                  <Link href="https://t.me/EthosAnn" color="inherit" target="_blank">
                    <TelegramIcon></TelegramIcon>
                  </Link>
                  <Link href="https://twitter.com/EthosProjectBSC" target="_blank">
                    <TwitterIcon></TwitterIcon>
                  </Link>
                </Typography>
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
    padding: '80px 0px',
    boxShadow: '0 0 25px 0 rgb(0 0 0 / 10%)',
    transition: 'all 0.4s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative',

    [theme.breakpoints.down("md")]: {
      padding: '60px 0px',
    },
    [theme.breakpoints.down("sm")]: {
      padding: '20px 0px',
    },

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
    color: '#2a2f31',
    fontWeight: 500,
    fontSize: '1.68rem',
    [theme.breakpoints.down("md")]: {
      fontSize: '1.3rem'
    },
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
  cardMainBody: {
    position: 'relative',
    width: '100%',
    marginTop: 30,
    [theme.breakpoints.down("sm")]: {
      marginTop: 10
    }
  },
  cardValue: {
    color: '#2a2f31',

    [theme.breakpoints.down("md")]: {
      fontSize: '1.2rem'
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: '1rem'
    }
  },
  swapButton: {
    color: '#2a2f31',
    padding: 7,
    fontSize: '1.48rem',
    fontWeight: 400,
    backgroundImage: 'linear-gradient(267deg, #738ca2, transparent)',
    marginTop: 20,
    width: '100%',
    boxShadow: '0px 0px 0px 0px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 5%), 0px 0px 0px 0px rgb(0 0 0 / 12%)',

    '&:hover': {
      boxShadow: '0px 0px 0px 0px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 12%), 0px 0px 0px 0px rgb(0 0 0 / 12%)'
    },
    [theme.breakpoints.down("md")]: {
      fontSize: '1.3rem'
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: '1.3rem'
    },

    span: {
      color: '#2a2f31'
    }
  },
  lineItem: {
    width: '100%',
    padding: '3px !important'
  }
}));

export default Home;
