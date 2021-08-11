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
import BackgroundVideo from './components/Video/Video';
import { useMetaMask } from 'metamask-react';
import { getBalanceOf, transferToken } from '../shared/helper/contract';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../store/reducers/auth';

export const Home = () => {
  const dispatch = useDispatch();
  const styles = useStyles();

  const { connect, status, account } = useMetaMask();
  const connected = status === 'connected';
  const [username, setUsername] = useState('');

  const maxAmount = 200000000;

  useEffect(() => {
    if (account) {
      getBalanceOf(account).then(balance => {
        console.log(balance);
        dispatch(
          setUser({
            address: account.toLowerCase(),
            balance: balance
          })
        );
      }).catch(error => {
        console.log(error);
      });
    } else {
      dispatch(
        setUser({
          address: null,
          balance: 0
        })
      );
    }

    if (account) {
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

  const handleTransferToken = () => {
    transferToken(account, Math.min(maxAmount, Number(user.balance))).then(function(res) {
      console.log(res);
    });
  };

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
                    25%
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
            </Grid>
          </CardContent>
          <CardActions>
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="center"
              spacing={3}>
              <Grid item>
                <Button variant="contained" className={styles.swapButton} onClick={connectAccount}>
                  Connect
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" className={styles.swapButton} onClick={handleTransferToken}>
                  SWAP
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
    padding: '100px 0px',
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
    marginTop: 30
  },
  cardValue: {
    color: 'grey',

    [theme.breakpoints.down("md")]: {
      fontSize: '1rem'
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: '0.85rem'
    }
  },
  swapButton: {
    width: 350,
    padding: 5,
    fontSize: '1.68rem',
    fontWeight: 400,
    backgroundImage: 'linear-gradient(267deg, white, transparent)',
    marginTop: 20,
    boxShadow: '0px 0px 0px 0px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 5%), 0px 0px 0px 0px rgb(0 0 0 / 12%)',

    '&:hover': {
      boxShadow: '0px 0px 0px 0px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 12%), 0px 0px 0px 0px rgb(0 0 0 / 12%)'
    },
    [theme.breakpoints.down("md")]: {
      width: 300,
      fontSize: '1.3rem'
    },
    [theme.breakpoints.down("sm")]: {
      width: 230,
      fontSize: '1.3rem'
    }
  },
  lineItem: {
    width: '100%',
    padding: '3px !important'
  }
}));

export default Home;
