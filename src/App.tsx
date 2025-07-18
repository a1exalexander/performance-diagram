import { useMemo, useRef } from "react";
import { categories } from "./data/categories";
import {
  Radar,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useBoolean, useLocalStorage, useTimeout } from "usehooks-ts";
import { addQuarters, format, startOfYear } from "date-fns";
import downloadjs from "downloadjs";
import html2canvas from "html2canvas";
import {
  map,
  find,
  each,
  findIndex,
  filter,
  range,
  first,
  toLower,
} from "lodash";
import clsx from "clsx";
import styles from "./App.module.css";
import { colors } from "./data/colors";

const MAX_MARK = 10;

interface DataItemInteface {
  subject: string;
  [key: string]: number | string;
  fullMark: number;
}

interface MarkInterface {
  periodId: string;
  subjectId: string;
  value: number;
}

interface PeriodInterface {
  id: string;
  value: string;
  color: string;
}

const defaultCategory = first(categories)?.name as string;

const defaultPeriods = map(range(12), (i) => ({
  id: i.toString(),
  value: i < 6 ? format(addQuarters(startOfYear(new Date()), i), "QQQQ yyyy"): '',
  color: colors[i],
}));
const defaultSubjects =
  find(categories, ({ name }) => toLower(name) === toLower(defaultCategory))
    ?.options || [];

function App() {
  const chartRef = useRef<HTMLDivElement>(null);
  const reseted = useBoolean(false);
  const [activeCategory, setActiveCategory] = useLocalStorage<string>(
    "activeSubject",
    defaultCategory
  );
  const [periods, setPeriods] = useLocalStorage<PeriodInterface[]>(
    "periods",
    defaultPeriods
  );
  const [subjects, setSubjects] = useLocalStorage<string[]>(
    "subjects",
    find(categories, ({ name }) => toLower(name) === toLower(activeCategory))
      ?.options || []
  );

  const [marks, setMarks] = useLocalStorage<MarkInterface[]>("marks", []);

  const onChangeSubjects = (value: string) => {
    setActiveCategory(value);
    setSubjects(
      find(categories, ({ name }) => toLower(name) === toLower(value))
        ?.options || []
    );
    setMarks([]);
  };

  const data = useMemo<DataItemInteface[]>(() => {
    const data: DataItemInteface[] = [];
    const fullMark = MAX_MARK;

    each(
      filter(subjects, (item) => !!item),
      (subject) => {
        const item: DataItemInteface = {
          subject: subject,
          fullMark,
        };

        each(periods, (period) => {
          if (!period.value) {
            return;
          }
          const mark = find(marks, {
            periodId: period.id,
            subjectId: subject,
          });
          if (mark) {
            item[period.value] = mark.value;
          }
        });

        data.push(item);
      }
    );

    return data;
  }, [periods, subjects, marks]);

  const activePeriods = useMemo(() => {
    return filter(periods, (period) => !!period.value);
  }, [periods]);

  const onDownloadImage = async () => {
    if (chartRef?.current) {
      const canvas = await html2canvas(chartRef.current);
      const dataURL = canvas.toDataURL("image/png");
      downloadjs(dataURL, "download.png", "image/png");
    }
  };

  useTimeout(() => reseted.setFalse(), reseted.value ? 100 : null);

  const onReset = () => {
    reseted.setTrue();
    localStorage.clear();
    setActiveCategory(defaultCategory);
    setPeriods([...defaultPeriods]);
    setSubjects([...defaultSubjects]);
    setMarks([]);
  };

  return (
    <main className={styles.container}>
      <div className={styles.chartWrapper} ref={chartRef}>
        <ResponsiveContainer width={1000} height={800}>
          <RadarChart
            className={styles.chart}
            outerRadius={250}
            data={data}
          >
            <PolarGrid />
            <PolarRadiusAxis
              fill="transparent"
              domain={[0, 10]}
              angle={90}
              tickCount={11}
              tick={{
                fontSize: "14px",
                style: { transform: "translateX(2px)" },
              }}
            />
            <PolarAngleAxis
              dataKey="subject"
              tickSize={20}
              width={200}
              tick={{ fontSize: "18px" }}
            />
            <Legend />
            {map(activePeriods, (period, idx) => {
              return (
                <Radar
                  name={period.value}
                  key={period.id}
                  dataKey={period.value}
                  stroke={colors[idx]}
                  fill={colors[idx]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                  dot={{ fill: "#8884d8", r: 2 }}
                />
              );
            })}
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.buttons}>
        <button className={styles.button} onClick={onDownloadImage}>
          Download Image
        </button>
        <button className={styles.button} onClick={onReset}>
          Reset
        </button>
      </div>
      <div className={styles.tableWrapper}>
        {!reseted.value && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={clsx(styles.th, styles.periodHead)}>Period</th>
                {map(periods, (period) => {
                  return (
                    <th
                      className={clsx(styles.th, styles.periodTh)}
                      key={period.id}
                      style={{ backgroundColor: period.color }}
                    >
                      <input
                        className={styles.input}
                        type="text"
                        value={period.value}
                        onChange={(e) => {
                          setPeriods((prev) => {
                            const newData = [...prev];
                            const idx = findIndex(newData, { id: period.id });
                            if (idx >= 0) {
                              newData.splice(idx, 1, {
                                ...newData[idx],
                                value: e.target.value,
                              });
                            }
                            return newData;
                          });
                        }}
                      />
                    </th>
                  );
                })}
              </tr>
              <tr>
                <th className={styles.th}>
                  Subject
                  <select
                    className={styles.select}
                    value={activeCategory}
                    onChange={(e) => onChangeSubjects(e.target.value)}
                  >
                    {map(map(categories, "name"), (name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </th>
                {map(periods, (period) => (
                  <th key={period.id} className={styles.th}>
                    Mark
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {map(subjects, (subject) => {
                return (
                  <tr key={subject}>
                    <td className={styles.td}>
                      <input
                        type="text"
                        className={styles.input}
                        value={subject}
                        onChange={(e) => {
                          setSubjects((prev) => {
                            const newData = [...prev];
                            const idx = findIndex(
                              newData,
                              (dataName) => dataName === subject
                            );
                            if (idx >= 0) {
                              newData.splice(idx, 1, e.target.value);
                            }
                            return newData;
                          });
                        }}
                      />
                    </td>
                    {map(periods, (period) => {
                      const mark = find(marks, {
                        periodId: period.id,
                        subjectId: subject,
                      });
                      return (
                        <td className={styles.td} key={period.id}>
                          <input
                            className={styles.input}
                            type="number"
                            tabIndex={period.value ? undefined : -1}
                            value={mark?.value}
                            min={0}
                            max={MAX_MARK}
                            onChange={(e) => {
                              setMarks((prev) => {
                                const newData = [...prev];
                                const idx = findIndex(newData, {
                                  periodId: period.id,
                                  subjectId: subject,
                                });
                                if (idx >= 0) {
                                  newData.splice(idx, 1, {
                                    ...newData[idx],
                                    value: parseFloat(e.target.value),
                                  });
                                } else {
                                  newData.push({
                                    periodId: period.id,
                                    subjectId: subject,
                                    value: parseFloat(e.target.value),
                                  });
                                }
                                return newData;
                              });
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

export default App;
