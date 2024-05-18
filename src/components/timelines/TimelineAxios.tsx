/***
 * 时间轴刻度
 */
export const TimelineAxios: React.FC<{ totalTimeInt: number, secondWidth: number }> = ({ totalTimeInt, secondWidth }) => {
  return (
    <div className="axios-timelines">
      <div className="left-gap"></div>
      {[...Array(totalTimeInt)].map((_, index) => (
        <div key={index} className="axis-second" style={{ width: `${secondWidth}px` }}>
          <div className={`second-time ${secondWidth <= 50 ? 'littie-size' : ''}`}>
            {index}
          </div>
          <div className="second-line">
            {
              [...Array(11)].map((_, i) => (
                <div
                  key={i}
                  className={[
                    i === 0 && 'first-line',
                    i === 5 && 'middle-line',
                    i === 10 && 'last-line',
                    secondWidth <= 50 && 'littie-size'
                  ].filter(Boolean).join(' ')}
                >
                  <span>{ i === 5 ? (index + 0.5) : '' }</span>
                </div>
              ))
            }
          </div>
        </div>
      ))}
    </div>
  );
};
