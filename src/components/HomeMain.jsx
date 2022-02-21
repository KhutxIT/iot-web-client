import React, { useEffect, useState } from 'react';
import { Switch } from '@material-ui/core';
import call_api from '../services/request';
import SensorChart from './SensorChart';
import { HiLightBulb } from 'react-icons/hi';
import { WiHumidity } from 'react-icons/wi';
import { FaTemperatureHigh } from 'react-icons/fa';
import { makeStyles, Backdrop, CircularProgress } from '@material-ui/core';

const TIME_INTERVAL = 1000 * 60 * 30;

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

function DHT11SensorBox({ data }) {
    return (
        <div className="mt-3 p-3 border rounded shadow">
            <h6><WiHumidity color='#2196f3' /> Humidity</h6>
            <h6 className="pl-3 text-primary">{data ? data.humidity : ''} %</h6>
            <h6><FaTemperatureHigh color='#e53935' /> Temperature</h6>
            <h6 className="pl-3 text-danger">{data ? data.temperature : ''} °C</h6>
        </div>
    );
}

function LedSensorBox({ handle, checked, name }) {
    return (
        <div className='mt-3 p-2 border rounded shadow'>
            <h6>{ name }</h6>
            <div className="d-flex">
                <HiLightBulb color={checked ? '#ffc400' : 'gray'} size='2em' />
                <Switch className="ml-auto" onChange={handle} checked={checked} />
            </div>
        </div>
    );
}

function HomeMain() {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const handleClose = () => {
        setOpen(false);
    };
    const [dataChart, setDataChart] = useState([]);
    const [dataLed1, setDataLed1] = useState({ data: { status: false } });
    const [dataLed2, setDataLed2] = useState({ data: { status: false } });
    const [dataDht11, setDataDht11] = useState();

    async function getDataSensor() {
        const res = await call_api({
            method: 'GET',
            url: '/sensor'
        });

        console.log(res.data.data);

        const [led1, led2, dht11, weeklyLightsUsedTime] = res.data.data;
        setDataLed1(led1);
        setDataLed2(led2);
        setDataDht11(dht11);

        const _dataChart = weeklyLightsUsedTime?.data.map(item => [item.time, item.led1, item.led2]);
        _dataChart.unshift(['time', 'Living Room Light', 'Bed Room Light']);

        setDataChart(_dataChart);
    }

    async function turnOnOffLed(data) {
        const res = await call_api({
            method: 'POST',
            url: '/lights/operations',
            data: {
                name: data.name,
                data: data.data
            }
        });
        console.log(res);
    }

    function handleChangeLed1Status() {
        const dataUpdate = {
            name: dataLed1.name,
            data: {
                status: !dataLed1.data.status
            }
        };
        setDataLed1(dataUpdate);
        turnOnOffLed(dataUpdate);
    };

    function handleChangeLed2Status() {
        const dataUpdate = {
            name: dataLed2.name,
            data: {
                status: !dataLed2.data.status
            }
        };
        setDataLed2(dataUpdate);
        turnOnOffLed(dataUpdate);
    };

    useEffect(async () => {
        setOpen(true);
        await getDataSensor();
        console.log('ahihi');
        setOpen(false);

        setInterval(async () => {
            await getDataSensor();
        }, TIME_INTERVAL);
    }, []);

    return (
        <div className="container mt-2">
            <Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <div className="row">
                <div className="col-lg-8">
                    <SensorChart data={dataChart} />
                </div>
                <div className="col-lg-4">
                    <div className="row">
                        <div className="col-md-6">
                            <LedSensorBox handle={handleChangeLed1Status} checked={dataLed1?.data?.status} name="Living Room Light" />
                            <LedSensorBox handle={handleChangeLed2Status} checked={dataLed2?.data?.status} name="Bedroom Light" />
                        </div>
                        <div className="col-md-6">
                            <DHT11SensorBox data={dataDht11?.data} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeMain;