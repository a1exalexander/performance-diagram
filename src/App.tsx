import { useMemo, useRef } from 'react';
import * as subjectsDB from './data/subjects';
import {
  Radar,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { useLocalStorage } from 'usehooks-ts';
import { format } from 'date-fns';
import downloadjs from 'downloadjs';
import html2canvas from 'html2canvas';
import { map, keys, find, each, findIndex, filter } from 'lodash';
import clsx from 'clsx';
import styles from './App.module.css';

const colors: string[] = ['#8884d8', '#82ca9d', '#ffc658'];

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
}

interface SubjectInterface {
  id: string;
  value: string;
}

function App() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [activeSubject, setActiveSubject] = useLocalStorage<
    keyof typeof subjectsDB
  >('activeSubject', 'development');
  const [periods, setPeriods] = useLocalStorage<PeriodInterface[]>('periods', [
    { id: '1', value: format(new Date(), 'MMMM yyyy') },
    { id: '2', value: '' },
    { id: '3', value: '' },
    { id: '4', value: '' },
    { id: '5', value: '' },
    { id: '6', value: '' },
  ]);
  const [subjects, setSubjects] = useLocalStorage<SubjectInterface[]>(
    'subjects',
    subjectsDB[activeSubject]
  );
  const [marks, setMarks] = useLocalStorage<MarkInterface[]>('marks', []);

  const onChangeSubjects = (value: keyof typeof subjectsDB) => {
    setActiveSubject(value);
    setSubjects(subjectsDB[value]);
    setMarks([]);
  };

  const data = useMemo<DataItemInteface[]>(() => {
    const data: DataItemInteface[] = [];
    const fullMark = MAX_MARK;

    each(
      filter(subjects, (item) => !!item.value),
      (subject) => {
        const item: DataItemInteface = {
          subject: subject.value,
          fullMark,
        };

        each(periods, (period) => {
          if (!period.value) {
            return;
          }
          const mark = find(marks, {
            periodId: period.id,
            subjectId: subject.id,
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
      const dataURL = canvas.toDataURL('image/png');
      downloadjs(dataURL, 'download.png', 'image/png');
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.chartWrapper} ref={chartRef}>
        <RadarChart
          className={styles.chart}
          width={1000}
          height={600}
          data={data}>
          <PolarGrid />
          <PolarRadiusAxis
            fill="transparent"
            domain={[0, 10]}
            angle={90}
            tickCount={11}
            tick={{
              fontSize: '14px',
              style: { transform: 'translateX(2px)' },
            }}
          />
          <PolarAngleAxis
            dataKey="subject"
            tickSize={20}
            tick={{ fontSize: '20px', fill: 'black' }}
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
                dot={{ fill: '#8884d8', r: 2 }}
              />
            );
          })}
        </RadarChart>
      </div>
      <button className={styles.button} onClick={onDownloadImage}>
        Download Image
      </button>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={clsx(styles.th, styles.periodHead)}>Period</th>
            {map(periods, (period) => {
              return (
                <th className={styles.th} key={period.id}>
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
                value={activeSubject}
                onChange={(e) =>
                  onChangeSubjects(e.target.value as keyof typeof subjectsDB)
                }>
                {map(keys(subjectsDB), (key) => (
                  <option key={key} value={key}>
                    {key}
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
              <tr key={subject.id}>
                <td className={styles.td}>
                  <input
                    type="text"
                    className={styles.input}
                    value={subject.value}
                    onChange={(e) => {
                      setSubjects((prev) => {
                        const newData = [...prev];
                        const idx = findIndex(newData, { id: subject.id });
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
                </td>
                {map(periods, (period) => {
                  const mark = find(marks, {
                    periodId: period.id,
                    subjectId: subject.id,
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
                              subjectId: subject.id,
                            });
                            if (idx >= 0) {
                              newData.splice(idx, 1, {
                                ...newData[idx],
                                value: parseFloat(e.target.value),
                              });
                            } else {
                              newData.push({
                                periodId: period.id,
                                subjectId: subject.id,
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
    </main>
  );
}

export default App;
