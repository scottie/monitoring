import React from 'react';
import { Grid, withStyles, WithStyles, StyleRulesCallback, Typography } from '@material-ui/core';
import { useQuery } from '@apollo/react-hooks';
import FundDetailsQuery from '~/queries/FundDetailsQuery';
import { useRouter } from 'next/router';
import { createQuantity, createToken, toFixed } from '@melonproject/token-math';

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import moment from 'moment';

const styles: StyleRulesCallback = theme => ({});

type FundProps = WithStyles<typeof styles>;

const Fund: React.FunctionComponent<FundProps> = props => {
  const router = useRouter();
  const result = useQuery(FundDetailsQuery, {
    ssr: false,
    variables: {
      fund: router.query.address,
    },
  });

  const fund = result.data && result.data.fund;
  const assets = (result.data && result.data.assets) || [];

  const token = createToken('WETH', undefined, 18);

  const normalizedGavs =
    fund &&
    fund.calculationsUpdates.map((item, index, array) => {
      return {
        ...item,
        gav: toFixed(createQuantity(token, item.gav)),
        totalSupply: toFixed(createQuantity(token, item.totalSupply)),
        change: index > 0 ? item.grossSharePrice / array[index - 1].grossSharePrice - 1 : 0,
      };
    });

  const shares = fund && toFixed(createQuantity(token, fund.totalSupply));
  const investmentLog = fund && fund.investmentLog;
  const holdingsLog = fund && fund.holdingsLog;
  const holdingsLength = holdingsLog && holdingsLog.length;

  const groupedHoldingsLog: any[] = [];
  let ts = 0;
  for (let k = 0; k < holdingsLength; k++) {
    if (ts !== holdingsLog[k].timestamp) {
      groupedHoldingsLog.push({
        timestamp: holdingsLog[k].timestamp,
        [holdingsLog[k].asset.symbol]: holdingsLog[k].holding,
      });
      ts = holdingsLog[k].timestamp;
    } else {
      groupedHoldingsLog[groupedHoldingsLog.length - 1][holdingsLog[k].asset.symbol] = holdingsLog[k].holding;
    }
  }

  return (
    <Grid container={true} spacing={6}>
      <Grid item={true} xs={12}>
        <Typography variant="h5">Fund information</Typography>

        {fund && (
          <>
            <div>Address: {fund.id}</div>
            <div>Name: {fund.name}</div>
            <div># shares: {shares}</div>
          </>
        )}
      </Grid>
      <Grid item={true} xs={12}>
        <Typography variant="h5">GAV / # Shares</Typography>

        <ResponsiveContainer height={200} width="80%">
          <LineChart width={400} height={400} data={normalizedGavs}>
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={timeStr => moment(timeStr * 1000).format('MM/DD/YYYY')}
            />
            <YAxis />
            <Line type="monotone" dataKey="gav" dot={false} />
            <Line type="monotone" dataKey="totalSupply" dot={false} />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </Grid>
      <Grid item={true} xs={12}>
        <Typography variant="h5">Share Price</Typography>

        <ResponsiveContainer height={200} width="80%">
          <LineChart width={400} height={400} data={normalizedGavs}>
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={timeStr => moment(timeStr * 1000).format('MM/DD/YYYY')}
            />
            <YAxis />
            <Line type="monotone" dataKey="grossSharePrice" dot={false} />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </Grid>
      <Grid item={true} xs={12}>
        <Typography variant="h5">Daily change</Typography>

        <ResponsiveContainer height={200} width="80%">
          <LineChart width={400} height={400} data={normalizedGavs}>
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={timeStr => moment(timeStr * 1000).format('MM/DD/YYYY')}
            />
            <YAxis />
            <Line type="monotone" dataKey="change" dot={false} />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </Grid>
      <Grid item={true} xs={12}>
        <Typography variant="h5">Investment Log</Typography>
        {investmentLog &&
          investmentLog.map(item => (
            <div key={item.id}>
              {item.timestamp} - {item.action} - {item.shares} - {item.owner.id}
            </div>
          ))}
      </Grid>
      <Grid item={true} xs={12}>
        <Typography variant="h5">Fund holdings</Typography>
        <ResponsiveContainer height={200} width="80%">
          <LineChart width={400} height={400} data={groupedHoldingsLog}>
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={timeStr => moment(timeStr * 1000).format('MM/DD/YYYY')}
            />
            <YAxis />
            {assets.map(item => (
              <Line type="monotone" dataKey={item.symbol} dot={false} key={item.id} />
            ))}
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(Fund);
