"use client";

// import charts
import {PieChartHumidity} from "@/app/ui/dashboard/PieChartHumidity";
import {PieChartTemperature} from "@/app/ui/dashboard/PieChartTemperature";
import {ChartElement} from "@/app/ui/dashboard/ChartElement";

// import components
import {DateRangeElement} from "@/app/ui/dashboard/DateRangeElement";
import {EspMap} from "@/app/ui/plan/espMap";
import {Card, CardContent, CardTitle} from "@/components/ui/card";

// import script
import {
    calculateAverage,
    GetEspPosition,
    useFetchData,
    useLastData,
} from "@/lib/data";

// import libraries
import {differenceInDays, endOfWeek, format, startOfWeek} from "date-fns";
import {DateRange} from "react-day-picker";
import React, {useState, useEffect} from "react";

import {useRouter, useSearchParams} from "next/navigation";

import RenameElement from "@/app/ui/dashboard/RenameElement";
import useFindIpById from "@/lib/data";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// main component
export default function Page({params}: { params: any }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Date range selector
    const [date, setDate] = useState<DateRange | undefined>(() => {
        const now = new Date();
        return {
            from: startOfWeek(now),
            to: endOfWeek(now),
        };
    });

    const esp = GetEspPosition(params.espId);

    // Get data from the selected esp and date range
    const from = date?.from ? format(date.from, "yyyy-MM-dd") : "";
    const to = date?.to ? format(date.to, "yyyy-MM-dd") : "";
    const [precision, setPrecision] = useState("Day");

    // Get the ip of the selected esp and fetch the data for the graphic
    const ip = useFindIpById(params.espId);
    const allData = useFetchData(precision, ip, from, to);

    // Data for the pie chart
    const temperature = useLastData("temperature", ip);
    const humidity = useLastData("humidity", ip);

    const averageTemperature = calculateAverage(allData, "avg_temperature");
    const averageHumidity = calculateAverage(allData, "avg_humidity");

    const [hoveredCircle, setHoveredCircle] = useState<string>("");
    const mouseClick = (circle: string) => {
        setHoveredCircle(circle);
    };

    const handleDateChange = (newDate: DateRange | undefined) => {
        const from = newDate?.from ? newDate.from.toISOString() : "";
        const to = newDate?.to ? newDate.to.toISOString() : "";
        router.push(
            `/dashboard/esp/${params.espId}?precision=${precision}&from=${from}&to=${to}`,
        );
    };

    useEffect(() => {
        const precisionParam = searchParams.get("precision");
        const fromParam = searchParams.get("from");
        const toParam = searchParams.get("to");

        if (precisionParam) {
            setPrecision(precisionParam);
        }

        if (fromParam && toParam) {
            setDate({
                from: new Date(fromParam),
                to: new Date(toParam),
            });
        }
    }, [searchParams]);

    const handleSelect = (value: any) => {
        setPrecision(value);
        router.push(
            `/dashboard/esp/${params.espId}?precision=${value}&from=${date?.from?.toISOString()}&to=${date?.to?.toISOString()}`,
        );
    };

    const dateRangeInDays =
        date?.from && date?.to ? differenceInDays(date.to, date.from) : 0;

    return (
        <div className="flex h-full w-full min-w-[500px] flex-col gap-y-5 pt-2">

            <div className="flex items-center gap-2">
                all data : {allData.length}
                <div className="flex items-center gap-2">
                    <span className="text-xl">Precision :</span>
                    <span className="text-xl">{precision}</span>
                </div>
            </div>

            <div className="flex justify-between text-xl font-bold uppercase">
                <div>{esp.name}</div>
                <RenameElement id={params.espId}/>
            </div>
            <div className="mt-0 text-zinc-500">{esp.ip}</div>
            <div className="flex flex-col gap-x-5 gap-y-5 sm:flex-row">
                <DateRangeElement
                    date={date}
                    setDate={(newDate: DateRange | undefined) => {
                        setDate(newDate);
                        handleDateChange(newDate);
                    }}
                />

                <div className="w-fit">


                    <Select onValueChange={handleSelect}>
                        <SelectTrigger
                            id="select-precision"
                            className="w-[200px] dark:border-zinc-700 dark:bg-zinc-900"
                        >
                            <SelectValue placeholder={precision}></SelectValue>
                        </SelectTrigger>
                        <SelectContent
                            position="popper"
                            className="flex w-60 gap-2 dark:bg-zinc-800"
                        >
                            <SelectItem value="Month" className="cursor-pointer">
                                Month
                            </SelectItem>
                            <SelectItem
                                value="Day"
                                className="cursor-pointer rounded-none border-t-2 border-secondary dark:border-gray-700"
                            >
                                Day
                            </SelectItem>
                            <SelectItem
                                value="Hour"
                                className={`cursor-pointer rounded-none border-t-2 border-secondary dark:border-gray-700 ${dateRangeInDays > 7 ? "cursor-not-allowed opacity-50" : ""}`}
                                disabled={dateRangeInDays > 7}
                            >
                                Hour
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex w-full flex-col gap-x-5 gap-y-5 xl:flex-row">
                <Card className="w-full dark:border-zinc-700 dark:bg-zinc-900">
                    <CardTitle>
                        <p className="pl-6 pt-6 text-xl">Last data :</p>
                    </CardTitle>
                    <CardContent className="flex w-full justify-center">
                        <div className="flex flex-col gap-x-36 rounded-xl p-5 sm:flex-row">
                            <PieChartTemperature data={temperature}/>
                            <PieChartHumidity data={humidity}/>
                        </div>
                    </CardContent>
                </Card>

                <Card className="w-full dark:border-zinc-700 dark:bg-zinc-900">
                    <CardTitle>
                        <p className="pl-6 pt-6 text-xl">
                            Average data ( From{" "}
                            {date?.from ? format(date.from, "yyyy-MM-dd") : ""} to{" "}
                            {date?.to ? format(date.to, "yyyy-MM-dd") : ""}) :
                        </p>
                    </CardTitle>
                    <CardContent className="flex w-full justify-center">
                        <div className="flex flex-col gap-x-36 rounded-xl p-5 sm:flex-row">
                            <PieChartTemperature data={averageTemperature}/>
                            <PieChartHumidity data={averageHumidity}/>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="w-full dark:border-zinc-700 dark:bg-zinc-900">
                <CardContent>
                    <ChartElement data={allData}/>
                </CardContent>
            </Card>

            <Card className="flex justify-center rounded-xl dark:border-zinc-700 dark:bg-zinc-900">
                <CardContent>
                    <svg
                        className="h-[500px] w-[500px] xl:h-[1000px] xl:w-[1000px]"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 100 100"
                    >
                        <g className="downstairs transition-all duration-500 ease-in-out">
                            <path
                                className="barrier"
                                d="m 47.9,53.5 8.1,0 0,-3.3 m -44.9,24.7 0,25.1 m 3.1,-25.1 0,25.1 m 3.1,-25.1 0,25.1 m 3.1,-25.1 0,25.1 m 3.2,-25.1 0,25.1 m 3.1,-25.1 0,25.1 m 3.1,-25.1 0,25.1 m 58.2,-1.3 -21.6,0 m 10,-5.5 0,5.5 m -1.7,-5.5 0,5.5 m -1.6,-5.5 0,5.5 m -1.7,-5.5 0,5.5 m -1.6,-5.5 0,5.5 m -1.7,-5.5 0,5.5 m 19.9,-5.5 0,5.5 m -1.7,-5.5 0,5.5 m -1.6,-5.5 0,5.5 m -1.7,-5.5 0,5.5 m -1.6,-5.5 0,5.5 m -1.7,-5.5 0,5.5 M 78,93.2 78,98.7 M 91.8,3.52 91.8,11 m -49.5,37.1 -7.9,0 0,5.4 m 57.4,-7.5 0,6.9 m 2.8,2.9 -6.3,0 0,-2.9 m -17.6,-15.6 0,6.9 m -7.4,-7.4 0,6.9 M 58.7,6.94 58.7,29.9 M 22,41.3 l 7.5,0 M 79,52.9 79,64.4 m -1.7,-11.5 0,11.5 m 5.4,-11.5 -3.7,5.8 3.6,5.7 m -11.9,-5.8 0,5.8 m 1.6,-11.5 0,11.5 M 74,52.9 74,64.4 m 1.7,-11.5 0,11.5 m 7,-5.7 -5.2,0 m -45.9,7.9 0,-5.1 22.8,0 0,5.1 z"
                            />
                            <path
                                className="wall"
                                d="m 20.07,36.84 0,-1.81 2.16,0 0,1.81 z m 11.61,0 0,-1.81 -2.16,0 0,1.81 z m 29.31,8.4 2.28,0 0,-1.42 m 0,-6.84 0,-1.43 -20.29,0 0,9.52 m 15.73,-9.58 0,-5.47 m 0,-22.912 0,-5.073 33.06,0 0,2.166 m 0,6.729 0,35.05 3.42,0 0,18.36 -25.08,0 m -9.12,-28.79 0,9.75 -0.57,0.81 m 31.35,18.23 0,29.07 -25.58,0 m -8.11,-44.06 -0.57,0.85 -14.36,0 m -10.95,-5.13 10.78,0 0,4.9 0,3.54 m -2.91,0 7.86,0 0,-3.31 m 43.84,-14.65 -21.09,0 0,1.88 m 0,6.5 0,3.14 3.99,0 0,-11.52 m -44.29,14.48 0,3.48 5.01,0 m 48.97,-0.57 -13.68,0 0,5.7 6.84,0 m 17.67,-5.7 -7.41,0 m -5.07,0 0,11.4 m -21.15,-5.13 0,5.7 1.71,0 1.71,-2.28 0,-9.12 -3.42,0 0,0.57 m 4.63,18.24 0,0.64 m 0,0.64 0,0.64 m 0,0.64 0,0.65 m 0,0.64 0,0.64 m 0,0.64 0,0.64 m 0,0.64 0,0.64 m 0,0.64 0,0.65 m 0,0.64 0,0.64 0,0.64 m -46.75,-41.27 0,6.67 M 11,74.6 l 0,24.37 55.19,0 0,-16.39 -9.59,0 -3.65,-4.56 0,-3.42 -41.95,0 -6.271,-6.27 0,-27.02 17.101,0 m 7.52,0 2.85,0 0,3.76 -0.1,5.02 -5.13,-0.1 0,3.48"
                            />

                            <g className="text-[3px] text-blue-300 transition-all duration-500 ease-in-out">
                                <EspMap
                                    key={ip}
                                    cx={esp.x}
                                    cy={esp.y}
                                    ip={esp.ip}
                                    name={esp.name}
                                    hoveredCircle={hoveredCircle}
                                    setHoveredCircle={setHoveredCircle}
                                    mouseClick={mouseClick}
                                />
                            </g>
                        </g>
                    </svg>
                </CardContent>
            </Card>
        </div>
    );
}
