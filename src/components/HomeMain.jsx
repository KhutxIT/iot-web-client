import React, { useEffect, useState } from 'react';
import { Switch, TextField } from '@material-ui/core';
import call_api from '../services/request';
// import SensorChart from './SensorChart';
import { HiLightBulb } from 'react-icons/hi';
import { WiHumidity } from 'react-icons/wi';
import { FaTemperatureHigh } from 'react-icons/fa';
import { AiOutlineWarning } from 'react-icons/ai';
import { makeStyles, Backdrop, CircularProgress } from '@material-ui/core';

const TIME_INTERVAL = 1000 * 10;

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

function DHT11SensorBox({ data }) {
    return (
        <div className="p-2 border rounded shadow">
            <h6><WiHumidity color='#2196f3' /> Humidity</h6>
            <h6 className="pl-3 text-primary">{data ? data[1].toFixed(2) : ''} %</h6>
            <h6><FaTemperatureHigh color='#e53935' /> Temperature</h6>
            <h6 className="pl-3 text-danger">{data ? data[2].toFixed(2) : ''} °C</h6>
        </div>
    );
}

function LedSensorBox({ handle, checked }) {
    return (
        <div className="mt-4 p-3 border rounded shadow d-flex">
            <HiLightBulb color={checked ? '#ffc400' : 'gray'} size='2em' />
            <Switch className="ml-auto" onChange={handle} checked={checked} />
        </div>
    );
}

function SoundSensorBox({ handle, data }) {
    let dataSensor = data;

    function handleChangeAuto() {
        dataSensor.auto = !dataSensor.auto;
        handle(dataSensor);
    };

    function handleChangeMaxRange(e) {
        dataSensor.max_range = parseInt(e.target.value);
        handle(dataSensor);
    };

    function handleChangeMinRange(e) {
        dataSensor.min_range = parseInt(e.target.value);
        handle(dataSensor);
    };

    return (
        <div className="border rounded p-2 shadow">
            <div className="full-width d-flex">
                <h6 className="ml-1">Sound</h6>
                <h6 className="ml-auto mr-1">{data?.value?.toFixed(2)}</h6>
            </div>
            <div className="full-width d-flex mt-2">
                <h6 className="ml-1">Auto</h6>
                <Switch className="ml-auto mr-1" size='small' onChange={handleChangeAuto} checked={data?.auto} />
            </div>
            <h6 className="ml-1 mt-3 text-uppercase">range for auto</h6>
            <div className="full-width d-flex mt-3">
                <TextField
                    label="Max range"
                    type="number"
                    size='small'
                    value={data?.max_range}
                    onChange={handleChangeMaxRange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    color='secondary'
                    variant="outlined"
                />
            </div>
            <div className="full-width d-flex mt-3">
                <TextField
                    label="Min range"
                    type="number"
                    size='small'
                    value={data?.min_range}
                    onChange={handleChangeMinRange}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    color='secondary'
                    variant="outlined"
                />
            </div>
        </div>
    );
}

function MQ5SensorBox({ data }) {

    const status = data?.value > data?.danger ? "danger" : (data?.value > data?.warning ? "warning" : "safe");
    const style = status === "safe" ? "success" : status;

    return (
        <div className={"full-width mt-2 p-2 border rounded shadow border-" + style}>
            <h6 className="text-center text-uppercase">gas emissions</h6>
            <h6 className="text-center">{data?.value?.toFixed(2)}</h6>
            <h6 className={"text-center text-uppercase text-" + style}>
                {status !== 'safe' ? <AiOutlineWarning /> : ''}
                {status}
                {status !== 'safe' ? <AiOutlineWarning /> : ''}
            </h6>
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
    const [dataLed, setDataLed] = useState({ data: { status: false } });
    const [dataMQ5, setDataMQ5] = useState();
    const [dataSound, setDataSound] = useState({ data: { auto: false } });

    async function getDataSensor() {
        const res = await call_api({
            method: 'GET',
            url: '/sensor'
        });

        console.log(res.data.data);

        // const [dht11, led, mq5, sound] = res.data.data;
        // setDataLed(led);
        // setDataMQ5(mq5);
        // setDataSound(sound);
        const [led, dht11, mq5, sound] = res.data.data;
        setDataLed(led);
        // setDataMQ5(mq5);
        // setDataSound(sound);

        // const _dataChart = dht11.data.map(item => [item.time, item.humidity, item.temperature]);
        // _dataChart.unshift(['time', 'humidity', 'temperature']);

        // setDataChart(_dataChart);
    }

    async function updateDataSensor(data) {
        const res = await call_api({
            method: 'PUT',
            url: '/sensor',
            data: {
                name: data.name,
                data: data.data
            }
        });
        console.log(res);
    }

    function handleChangeLedStatus() {
        const dataUpdate = {
            name: dataLed.name,
            data: {
                status: !dataLed.data.status
            }
        };
        setDataLed(dataUpdate);
        updateDataSensor(dataUpdate);
    };

    function handleChangeSoundData(data) {
        const dataUpdate = {
            name: dataSound.name,
            data: data
        };
        setDataSound(dataUpdate);
        updateDataSensor(dataUpdate);
    };

    useEffect(async () => {
        setOpen(true);
        await getDataSensor();
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
                    {/* <SensorChart data={dataChart} /> */}
                </div>
                <div className="col-lg-4">
                    <div className="row">
                        <div className="col-md-6">
                            <DHT11SensorBox data={dataChart[dataChart.length - 1]} />
                            <LedSensorBox handle={handleChangeLedStatus} checked={dataLed?.data?.status} />
                        </div>
                        <div className="col-md-6">
                            <SoundSensorBox handle={handleChangeSoundData} data={dataSound?.data} />
                        </div>
                        <div className="col-12">
                            <MQ5SensorBox data={dataMQ5?.data} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeMain;