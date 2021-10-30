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
import {
  getBalanceOf,
  transferToken,
  approveAmount,
  sshibaDecimals,
  getCurrentBonusRatio,
  getUserDeposits,
  web3 as contractWeb3
} from '../shared/helper/contract';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../store/reducers/auth';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Link';
// import logo from '../../../src/assets/images/shiko_logo.png';

import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: "7164d3473be9437595f81d01b038a71b" // required
    }
  }
};

const web3Modal = new Web3Modal({
  network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions // required
});

export const Home = () => {
  const dispatch = useDispatch();
  const styles = useStyles();
  const [web3, setWeb3] = useState(null);

  // const [username, setUsername] = useState('');

  const maxAmount = 500000000000000;
  const endTime = new Date('2021-11-07');

  const [decimals, setDecimals] = useState(0);

  const [currentBonusRatio, setCurrentBonusRatio] = useState(0);

  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState('0');
  const [hours, setHours] = useState('0');
  const [mins, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const user = useSelector((state) => state.auth.user);

  const subscribeProvider = async (provider) => {
    provider.on("disconnect", (error) => {
      console.log(error);
    });
    provider.on("accountsChanged", (accounts) => {
      dispatch(setUser({ address: accounts[0] }));
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
      console.log(chainId);
    });
  };

  useEffect(() => {
    const account = user.address;

    if (account) {
      console.log(account)
      getBalanceOf(account).then(async (balance) => {
        const decimals = await sshibaDecimals();
        const bounsRatio = await getCurrentBonusRatio();
        const deposits = await getUserDeposits(account);
        console.log(deposits)
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
      contractWeb3.setProvider(Web3.givenProvider);
      // setUsername(account.slice(0, 4) + '...' + account.slice(-4));
    } else {
      // setUsername(null);
    }
    // eslint-disable-next-line
  }, [user.address]);

  const connectWallet = async () => {
    let web3 = new Web3(Web3.givenProvider);

    if (!web3.currentProvider) {
      console.error("No provider was found");
      return;
    }
    // try {
    //   await web3.currentProvider.request({
    //     method: "wallet_switchEthereumChain",
    //     params: [{ chainId: "0xfa" }],
    //   });
    // } catch (switchError) {
    //   if (switchError.code === 4902) {
    //     try {
    //       await web3.currentProvider.request({
    //         method: "wallet_addEthereumChain",
    //         params: [
    //           {
    //             chainName: "Fantom Opera",
    //             chainId: "0xfa",
    //             nativeCurrency: {
    //               name: "Fantom",
    //               symbol: "FTM",
    //               decimals: 18,
    //             },
    //             rpcUrls: ["https://rpc.ftm.tools/"],
    //           },
    //         ],
    //       });
    //     } catch (addError) {}
    //   }
    // }

    const provider = await web3Modal.connect();

    web3 = new Web3(provider);
    setWeb3(web3);

    await subscribeProvider(provider);

    const accounts = await web3.eth.getAccounts();

    dispatch(
      setUser({
        address: accounts[0],
      })
    );
  }

  const onDisconnect = async () => {
    // TODO: Which providers have close method?
    await web3Modal.clearCachedProvider();

    dispatch(
      setUser({
        address: null,
      })
    );
  }


  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
    // eslint-disable-next-line
  }, []);

  const getTimeRemaining = () => {
    const t = endTime - Date.now();
    const s = Math.floor((t / 1000) % 60);
    const m = Math.floor((t / 1000 / 60) % 60);
    const h = Math.floor((t / (1000 * 60 * 60)) % 24);
    const d = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
      'total': t,
      'days': d,
      'hours': h,
      'minutes': m,
      'seconds': s
    };
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const t = getTimeRemaining();
      if (t.total <= 0) {
        setDays('00');
        setHours('00');
        setMinutes('00');
        setSeconds('00');
        return;
      }
      setDays(t.days);
      setHours(('0'.concat(t.hours.toString())).slice(-2));
      setMinutes(('0'.concat(t.minutes.toString())).slice(-2));
      setSeconds(('0'.concat(t.seconds.toString())).slice(-2));
    }, 1000);
    return () => clearTimeout(timer);
  });
  const toLimitDecimalString = (value, decimalDigits = 6) => {
    if (value === null) return;
    const valInt = `${+String(value).split(".")[0]}`;
    const valDecimal =
      String(value).indexOf(".") > -1 ? String(value).split(".")[1] : "";
    return valDecimal
      ? `${valInt}.${valDecimal.slice(0, +decimalDigits)}`
      : `${valInt}`;
  }

  const handleApproveAmount = async () => {
    setLoading(true);

    if (!user.address) {
      console.error('Please connect to wallet first!');
      await connectWallet();
    }

    const account = user.address;
    const amountToApprove = user.balance * 1.1;
    approveAmount(account, web3.utils.toWei(toLimitDecimalString(amountToApprove, decimals), 'gwei')).then((res) => {
      setLoading(false);
    }).catch((err) => {
      console.log(err)
      setLoading(false);
    });
  }

  const handleTransferToken = async () => {
    setLoading(true);

    if (!user.address) {
      console.error('Please connect to wallet first!');
      await connectWallet();
    }
    console.log(web3)

    const account = user.address;
    const amount = Math.min(maxAmount, +user.balance);
    const v = getDecimalAndInt(amount);
    const value = web3.utils.toBN(v.integer).mul(web3.utils.toBN(10 ** +(decimals - v.decimals)));
    transferToken(account, value).then(async (res) => {
      const balance = await getBalanceOf(account);
      const deposits = await getUserDeposits(account);
      dispatch(setUser({ address: account, balance, deposits }));
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
    <div>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        direction="column"
        className={styles.cardMainRoot}>
        <div style={{ position: 'relative', width: '100%' }}>
          <div className={styles.styledConnectRoot}>
            <Button
              variant="contained"
              className={styles.styledConnect}
              onClick={user.address ? onDisconnect : connectWallet}>
              {user.address ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        </div>
        <Grid item className={styles.overallTitle}>
          <Typography variant="h4" style={{ color: "#D8A331", fontWeight: 500 }}>
            Shiko - Dex Project
          </Typography>
        </Grid>
        <Grid item xs={11} sm={9} md={6} lg={4} style={{ width: '100%' }}>
          <Card className={styles.cardRoot}>
            <CardHeader
              title="TOKEN SWAP"
              classes={{ title: styles.cardMainTitle }}
            />
            <CardContent className={styles.cardMainBody}>
              <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={3}>
                <Grid item className={styles.lineItem} md={10} sm={10}>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center">
                    <Typography variant="h6" component="h6" className={styles.cardValue}>
                      SHIKO Balance:
                    </Typography>
                    <Typography variant="h6" component="h6" className={styles.cardValue}>
                      {Number(user.balance).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item className={styles.lineItem} md={10} sm={10}>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center">
                    <Typography variant="h6" component="h6" className={styles.cardValue}>
                      SHIKO Swapped:
                    </Typography>
                    <Typography variant="h6" component="h6" className={styles.cardValue}>
                      {Number(user.deposits).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item className={styles.lineItem} md={10} sm={10}>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center">
                    <Typography variant="h6" component="h6" className={styles.cardValue}>
                      Shiko-Dex Project Ratio:
                    </Typography>
                    <Typography variant="h6" component="h6" className={styles.cardValue}>
                      {Number(10000000).toLocaleString()} : 1
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item className={styles.lineItem} md={10} sm={10}>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center">
                    <Typography variant="h6" component="h6" className={styles.cardValue}>
                      Swap Bonus:
                    </Typography>
                    <Typography variant="h6" component="h6" className={styles.cardValue}>
                      {currentBonusRatio}%
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
                  <Grid container direction="column" justifyContent="center" alignItems="center" spacing={0}>
                    <Typography variant="h6" style={{ fontWeight: 400 }}>
                      Step1:
                    </Typography>
                    <Button variant="contained" className={styles.swapButton} onClick={handleApproveAmount} disabled={loading}>
                      {loading ? <CircularProgress color="inherit" size="33px" /> : 'Approve'}
                    </Button>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid container direction="column" justifyContent="center" alignItems="center">
                    <Typography variant="h6" style={{ fontWeight: 400 }}>
                      Step2:
                    </Typography>
                    <Button variant="contained" className={styles.swapButton} onClick={handleTransferToken} disabled={loading} xs={12}>
                      {loading ? <CircularProgress color="inherit" size="33px" /> : 'Swap'}
                    </Button>
                  </Grid>
                </Grid>
                <Grid item style={{ paddingTop: 0 }}>
                  <Grid container direction="column" justifyContent="center" alignItems="center">
                    <Typography variant="h6" component="h6" className={styles.cardValue}>
                      MAX 500 Trillion SHIKO per Swap
                    </Typography>
                    <Typography variant="h6" component="h6" className={styles.cardValue}>
                      Repeat Step 2 until 0 SHIKO Balance
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="center">
                    <Grid item>
                      <Typography variant="h6" style={{ fontWeight: 300, fontSize: '1.2rem' }}>
                        Swap Ends:
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Grid
                        container
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
                        className={styles.timerStyle}>
                        <Grid item>
                          <Typography variant="inherit">
                            {days}&nbsp;:&nbsp;
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="inherit">
                            {hours}&nbsp;:&nbsp;
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="inherit">
                            {mins}&nbsp;:&nbsp;
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="inherit">
                            {seconds}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  mt={10}
                  spacing={1}>
                  <Grid item>

                    <Typography variant="h5" component="h5">
                      <Link href="https://t.me/SHIKOEXCHANGE" color="inherit" target="_blank">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          aria-hidden="true"
                          role="img"
                          width="1.3em"
                          height="1.3em"
                          preserveAspectRatio="xMidYMid meet"
                          viewBox="0 0 20 20">
                          <g fill="#14243B">
                            <path d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10S4.477 0 10 0zm4.442 6c-.381.007-.966.207-3.779 1.362a485.41 485.41 0 0 0-5.907 2.512c-.48.189-.73.373-.753.553c-.044.346.46.453 1.094.657c.517.166 1.213.36 1.575.368c.328.007.694-.127 1.098-.4c2.76-1.84 4.183-2.769 4.273-2.789c.063-.014.15-.032.21.02c.059.052.053.15.046.177c-.05.211-2.641 2.538-2.79 2.691l-.072.072c-.55.543-1.105.898-.147 1.521c.866.563 1.37.922 2.26 1.5c.57.368 1.017.805 1.605.752c.271-.025.55-.276.693-1.026c.335-1.77.995-5.608 1.147-7.19a1.742 1.742 0 0 0-.017-.393a.42.42 0 0 0-.144-.27c-.121-.098-.309-.118-.392-.117z" />
                          </g>
                        </svg>
                      </Link>
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h5" component="h5">
                      <Link href="https://twitter.com/shikokuinu3" target="_blank">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          aria-hidden="true"
                          role="img"
                          width="1.5em"
                          height="1.5em"
                          preserveAspectRatio="xMidYMid meet"
                          viewBox="0 0 1024 1024">
                          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448s448-200.6 448-448S759.4 64 512 64zm215.3 337.7c.3 4.7.3 9.6.3 14.4c0 146.8-111.8 315.9-316.1 315.9c-63 0-121.4-18.3-170.6-49.8c9 1 17.6 1.4 26.8 1.4c52 0 99.8-17.6 137.9-47.4c-48.8-1-89.8-33-103.8-77c17.1 2.5 32.5 2.5 50.1-2a111 111 0 0 1-88.9-109v-1.4c14.7 8.3 32 13.4 50.1 14.1a111.13 111.13 0 0 1-49.5-92.4c0-20.7 5.4-39.6 15.1-56a315.28 315.28 0 0 0 229 116.1C492 353.1 548.4 292 616.2 292c32 0 60.8 13.4 81.1 35c25.1-4.7 49.1-14.1 70.5-26.7c-8.3 25.7-25.7 47.4-48.8 61.1c22.4-2.4 44-8.6 64-17.3c-15.1 22.2-34 41.9-55.7 57.6z"
                            fill="#14243B" />
                        </svg>
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </div >
  );
};

const useStyles = makeStyles((theme) => ({
  styledLogoRoot: {
    position: 'absolute',
    left: '80px',
    top: 0,

    [theme.breakpoints.down("sm")]: {
      left: '50%'
    },
  },
  styledConnectRoot: {
    position: 'absolute',
    right: '80px',
    top: 0,

    [theme.breakpoints.down("sm")]: {
      right: '50%'
    },
  },
  styledLogo: {
    position: "relative",
    left: 0,

    [theme.breakpoints.down("sm")]: {
      left: '-50%'
    },
  },
  styledConnect: {
    position: "relative",
    right: 0,
    color: '#D8A331',
    padding: 7,
    fontSize: '1.1rem',
    fontWeight: 400,
    background: 'linear-gradient(145deg, rgba(20,36,59,1) 0%, rgba(20,36,59,1) 70%, rgba(132,140,92,1) 105%)',
    marginTop: 5,
    width: '120px',
    boxShadow: '9px 5px 25px 1px #14243b',
    borderRadius: 18,
    border: "solid 1px",

    '&:hover': {
      boxShadow: '9px 5px 25px 1px #14243b'
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: '1.3rem',
      right: '-50%',
    },

    span: {
      color: '#2a2f31'
    }
  },
  overallTitle: {
    marginBottom: "20px",

    [theme.breakpoints.down("sm")]: {
      marginTop: '90px'
    },
  },
  timerStyle: {
    fontSize: '1.2rem',
    fontWeight: 600
  },
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
    padding: '60px 0px',

    [theme.breakpoints.down("350")]: {
      padding: '30px 0px',
    },
  },
  cardRoot: {
    color: 'black',
    padding: '20px 0px',
    boxShadow: '0 0 25px 0 rgb(0 0 0 / 10%)',
    transition: 'all 0.4s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D8A331',
    position: 'relative',
    borderRadius: '25px',

    "&:hover": {
      transform: 'translateY(-10px)'
    },
    "&::before": {
      content: '""',
      backgroundColor: '#D8A331',
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
    fontSize: '0.9rem',
    fontWeight: 300,

    [theme.breakpoints.down("md")]: {
      fontSize: '0.9rem'
    }
  },
  swapButton: {
    color: '#D8A331',
    padding: 7,
    fontSize: '1.1rem',
    fontWeight: 400,
    background: 'linear-gradient(145deg, rgba(20,36,59,1) 0%, rgba(20,36,59,1) 70%, rgba(132,140,92,1) 105%)',
    marginTop: 5,
    width: '120px',
    boxShadow: '9px 5px 25px 1px #14243b',
    borderRadius: 18,

    '&:hover': {
      boxShadow: '9px 5px 25px 1px #14243b'
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
