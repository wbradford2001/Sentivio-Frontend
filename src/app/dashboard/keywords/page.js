'use client'

import styles from "./page.module.css";
import React, { useState, useEffect, useRef, createRef } from 'react';

// import demography from './tempJsons/demography.json'

import locations from './locations.json'; 
// import relatedKeywords from './tempJsons/relatedKeywords.json'
// import keywordInfo from './tempJsons/keywordInfo.json'
// import searchIntent from './tempJsons/searchIntent.json'
import { Line, Doughnut, Bar } from "react-chartjs-2";

import Chart from 'chart.js/auto';

import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';


import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';



let relatedKeywords;
let demography;
let searchIntent;
let keywordInfo;
let searchQueerieInfo;

let lastSearchedISOCode;
let lastSearchedCountry;



function Dropdown(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropDownVal, setDropDownVal] = useState({"location_name": props.default_country, "country_iso_code": props.default_country_iso_code, "icon": `${props.default_country_iso_code}.svg`});

  const [selectedIndex, setSelectedIndex] = useState(locations.findIndex(location => location.location_name === dropDownVal.location_name));
  const dropdownRef = useRef(null)
  const dropdownRefs = useRef([]);
  dropdownRefs.current = locations.map((_, i) => dropdownRefs.current[i] ?? createRef());

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (location, index) => {
    setDropDownVal({"location_name": location["location_name"], "country_iso_code": location["country_iso_code"], "icon": location["flag"]});
    setSelectedIndex(index);
    props.updateParent(location);
    setIsOpen(false); // Close the dropdown explicitly here
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); // Directly set to false
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]); // Depend on isOpen to add/remove the listener correctly

  useEffect(() => {
    if (isOpen && dropdownRefs.current[selectedIndex]) {
      dropdownRefs.current[selectedIndex].scrollIntoView({
        behavior: 'instant',
        block: 'center'
      });
    }
  }, [isOpen, selectedIndex]);

  return (
      <div className={styles.dropContainer} ref = {dropdownRef}>
        <div className={styles.dropdown} onClick={toggleDropdown}>
            <div className={styles.dropbtn}>
              <img className = {styles.flagIcon}
                src = {`/icons/flags/${dropDownVal.icon}`}
              />
            </div>
            <div className={styles.dropbtn}>
              {dropDownVal["location_name"]}
            </div>
            <div className={styles.dropbtn}>
              <img style={{ transform: 'scale(0.5)' }} src="/icons/downArrow.svg" />
            </div>
        </div>

        {isOpen && (
          <div className={props.below? styles.DropDownContentBelow : styles.DropDownContentAbove}>
            {locations.map((location, index) => (
              <li key={index}
                  ref={el => dropdownRefs.current[index] = el}
                  className={`${styles.DropDownItem} ${(location.location_name == dropDownVal.location_name)? styles.curSelected : null}`}
                  onClick={() => handleSelect(location, index)}>
                {location.location_name}
                <img className = {styles.flagIcon} src={`/icons/flags/${location.flag}`} />
              </li>
            ))}
          </div>
        )}
      </div>
  );
}


function PostSearchBar(props) {

  const [locationVal, setLocationVal] = useState({"location_name": "United States", "country_iso_code": "US", "icon": `US.svg`});
  
  const [query, setQuery] = useState(searchQueerieInfo.Keyword);

  const handleSubmit = (event) => {
      event.preventDefault();
      props.onSearch(query, locationVal);
  };

  const updateMe = (location) => {
    setLocationVal(location)
  }

  return (
      <form onSubmit={handleSubmit} className = {styles.postSearchContainer}>
          <input
              className={styles.searchBar}
              type="text"
              placeholder="Enter keywords here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
          />
          <Dropdown
            default_country = {lastSearchedCountry? lastSearchedCountry:
              //localStorage.setItem("ISO_and_country", JSON.stringify({"iso":iso_code, "location":location}))

                JSON.parse(localStorage.getItem("ISO_and_country"))["location"]}
            default_country_iso_code = {lastSearchedISOCode? lastSearchedISOCode:
                JSON.parse(localStorage.getItem("ISO_and_country"))["iso"]
            }
            below = {true}
            className={styles.dropdown}
            updateParent = {updateMe}
          />
          {/* <Dropdown
            className={styles.dropdown}
          />           */}
          <button 
          
          className={styles.searchButton}
          type="submit"
          onClick = {handleSubmit}
          >
            <img

              src="/icons/searchbar.svg"
            />

          </button>
      </form>
  );
}

function SearchBar(props) {
  const [locationVal, setLocationVal] = useState({"location_name": "United States", "country_iso_code": "US", "icon": "US.svg"});
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
      event.preventDefault();
      props.onSearch(query, locationVal);
  };

  const updateMe = (location) => {
    setLocationVal(location)
  }


  return (
      <form onSubmit={handleSubmit} className = {styles.searchContainer}>
          <input
              className={styles.searchBar}
              type="text"
              placeholder="Enter keywords here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
          />
          <Dropdown
            default_country = {locationVal.location_name}
            default_country_iso_code = {locationVal.country_iso_code}
            below = {false}
            className={`${styles.dropdown}`}
            updateParent = {updateMe}
          />
          {/* <Dropdown
            className={styles.dropdown}
          />           */}
          <button 
          
          className={styles.searchButton}
          type="submit"
          onClick = {handleSubmit}
          >
            <img
              src="/icons/searchbar.svg"
            />

          </button>
      </form>
  );
}


const handleSearch = (query, locationVal) => {
  if (!query) {
  } else {
    window.location.href = `/dashboard/keywords?keyword=${query}&location=${locationVal["location_name"]}&iso_code=${locationVal["country_iso_code"]}`;
  }
};

export  function Search() {
  return (
    <div className={styles.masterDiv}>
      <div className={styles.box}>
          <div className = {styles.headerText}>
            Keyword Mastery, At Your Fingertips.
          </div>
          <div className = {styles.subheader}>
            Modernize your marketing with real-time insights and predictive keyword analytics.
          </div>
          <div >
            <SearchBar  onSearch={handleSearch} />
          </div>
      </div>
    </div>
  );
}

export function Loading() {
  const svgRef = React.useRef(null);

  const [progress, setProgress] = React.useState(0);
  const [loadingComplete, setLoadingComplete] = React.useState(false); // Tracks if loading should complete
  global.completeLoad = () => {
    setLoadingComplete(true)
    setProgress(100) 
    console.log("kdjfbnvdkfbv")

  
  }
  React.useEffect(() => {
    let totalDuration = 15000; // total duration in milliseconds initially estimated
    let currentProgress = 0;
  
    const updateProgress = () => {
      // Exponential decay formula: progress += initialSpeed * e^(-k*t)
      let increment = 3 * Math.exp(-0.05 * currentProgress); // Adjust 20 (initial speed) and 0.05 (decay rate) as needed
      currentProgress += increment;
      setProgress(currentProgress);
      if (currentProgress >= 95) { // Slow down and almost stop at 95%
        clearInterval(timer);
        if (loadingComplete) {
          setProgress(100); // Complete the progress bar when loading is actually complete
        }
      }
    };
    const timer = setInterval(updateProgress, 50);

  // Cleanup function to clear interval
  return () => {
    clearInterval(timer);
  };
}, [loadingComplete]); // Dependency on loadingComplete ensures effect reruns when it changes

  

  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: "var(--section-border)",
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: "var(--black-text)",

    },
  }));
  return (
    <div className={styles.loadingContainer}>
        <object
            ref={svgRef}
            className={styles.loadingGlasses}
            type="image/svg+xml"
            data={`/loadingGifs/SentivioLoadingLogoANIMATION.svg`}>
            Your browser does not support SVG
        </object>
        <div className={styles.loadingText}>
          <div>
            Generating Data
          </div>
          <object
            ref={svgRef}
            className={styles.loadingDots}
            type="image/svg+xml"
            data={`/loadingGifs/3dotsANIMATED.svg`}>
            Your browser does not support SVG
          </object>
        </div>
        <Box sx={{ width: '50%', marginY: "24px" }}>
          <BorderLinearProgress  className = {styles.progressBar}variant="determinate" value={progress} />
        </Box>
    </div>
  );
}

function DisplayInfoItem(props){
  try{

    const [showTooltip, setShowTooltip] = useState(false);

    return (
      
      <div className = {styles.infoContainer}>
        <div className={styles.infoTextContainer}>
          {props.label && (
            <div className = {styles.infoLabel}>
              {props.label}
            </div>
          )} 
          {props.data && (
          <div className ={styles.infoData} style = {{color: props.color}}>
            {props.data}
          </div>     
          )}
          {props.customEl && (
          <div className = {styles.customElContainer}>
            {props.customEl()}
          </div>     
          )}          
        </div>
        {props.label && 
        
          <div className={styles.infoIconContainer} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
            <img src={`/icons/info.svg`} className={styles.infoIcon}/>
            {showTooltip && <div className={styles.tooltip}>
              <div className={styles.mainToolTipText}>
                {props.infoTitle}
                
              </div>
              <div className={styles.subToolTipText}>
                {props.infoBody}
                
              </div>
            </div>}
          </div>
        }
      </div>
      
    
    )
  } catch {
    return (

      <div className = {styles.infoContainer}>
        Unable to display item.
      </div>
    )
  }
}


function ResponsiveLineChart() {
  const [monthsToShow, setMonthsToShow] = useState(12); // Default to showing the last 12 months

  // Function to calculate the difference in months between two dates
  function getMonthDifference(fromDate, toDate) {
    var year1 = fromDate.getFullYear();
    var year2 = toDate.getFullYear();
    var month1 = fromDate.getMonth();
    var month2 = toDate.getMonth();
    return (year2 - year1) * 12 + (month2 - month1);
  }

  // Function to filter data based on the number of months back from the current date
  function filterDataByMonths(data, monthsBack) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Normalize current date time to start of the day

    return data.filter(item => {
      const itemDate = new Date(item.year, item.month - 1);
      return getMonthDifference(itemDate, currentDate) < monthsBack;
    });
  }

  // Get filtered data based on the selected months to show
  const filteredData = filterDataByMonths(keywordInfo["monthly search"], monthsToShow);

  // Prepare the data for the chart
  const months = filteredData
    .map(item => `${new Date(item.year, item.month - 1).toLocaleString('default', { month: 'short' })} ${item.year}`)
    .reverse();
  const searchVolumes = filteredData
    .map(item => item.search_volume)
    .reverse();

  // Chart data and options
  const data = {
    labels: months,
    datasets: [{
      label: 'Search Volume',
      data: searchVolumes,
      fill: true,
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)"
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className={styles.graphComponent}>
      <div className={styles.graphDropdownContainer}>
        <select className={styles.graphSelect} value={monthsToShow} onChange={e => setMonthsToShow(Number(e.target.value))}>
          <option value="12" >12 Months</option>
          <option value="24">24 Months</option>
          <option value="36">36 Months</option>
          <option value="48">48 Months</option>
          <option value="60">60 Months</option>
        </select>
      </div>
      <Line data={data} options={options} />
    </div>
  );
}

const centerTextPlugin = {
  id: 'centerText',
  afterDraw: (chart) => {
    if (chart.config.options.plugins.centerText && chart.config.options.plugins.centerText.display) {
      const ctx = chart.ctx;
      ctx.save();
      const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
      const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
      //const fontSize = (height / 100).toFixed(2);
      ctx.font = `1000 64px Arial`; 
      const colorText = chart.config.options.plugins.centerText.colorText || '';

      ctx.fillStyle = colorText;  // Customize text color here
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const text = chart.config.options.plugins.centerText.text || '';
      ctx.fillText(text, centerX, centerY);
      ctx.restore();
    }
  }
};

// Register the plugin
Chart.register(centerTextPlugin);
const intentColors = {
  "navigational": "#00ACB7",
  "informational": "#A7AA00",
  "commercial": "#7CDD00",
  "transactional": "#006A2A"
}
function SearchIntentCircle() {
  // Assuming searchIntent["Probability"] holds a value from 0 to 100
  const probability = Math.round(searchIntent["Probability"] * 100);
  const remaining = 100 - probability;  // Remaining percentage to fill up 100%

  const data = {
    labels: ['Probability', 'Remaining'],
    datasets: [
      {
        label: 'Probability',
        data: [probability, remaining],
        backgroundColor: [
          intentColors[searchIntent["Intent"]], // Color for the probability
          '#ddd'  // Grey color for the remaining segment
        ],
        borderColor: [
          intentColors[searchIntent["Intent"]],  // Border color for the probability
          '#ccc'  // Border color for the remaining segment
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,  // Hides the legend
      },
      tooltip: {
        enabled: false,  // Enables tooltips
      },
      centerText: {
        display: true,  // Only display for this chart
        text: `${probability}`,
        colorText: intentColors[searchIntent["Intent"]]
      }
    },
    maintainAspectRatio: false,
    cutout: '70%'  // Adjust this for a thicker/thinner doughnut
  };

  return (
    <div className={styles.searchIntentCircle}>
      <Doughnut data={data} options={options} />
    </div>
  );
}





const compColors = {
  "LOW": "#007119",
  "MEDIUM": "#97b500",
  "HIGH": "#FF0000"
}
function getDiffLevel(num) {
  if (num <= 33){
    
    return "LOW"
  }
  else if (num <= 66){
    return "MEDIUM"
  }
  else if (num <= 100){
    return "HIGH"
  }
  return "MEDIUM"
}
function DifficultyCircle() {
  // Assuming searchIntent["Probability"] holds a value from 0 to 100
  const probability = keywordInfo["keyword info"]["Competition"]["keyword_difficulty"];
  const remaining = 100 - probability;  // Remaining percentage to fill up 100%

  const data = {
    labels: ['Probability', 'Remaining'],
    datasets: [
      {
        label: 'Probability',
        data: [probability, remaining],
        backgroundColor: [
          compColors[getDiffLevel(keywordInfo["keyword info"]["Competition"]["keyword_difficulty"])], // Color for the probability
          '#ddd'  // Grey color for the remaining segment
        ],
        borderColor: [
          compColors[getDiffLevel(keywordInfo["keyword info"]["Competition"]["keyword_difficulty"])], // Color for the probability
          '#ccc'  // Border color for the remaining segment
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,  // Hides the legend
      },
      tooltip: {
        enabled: false,  // Enables tooltips
      },
      centerText: {
        display: true,  // Only display for this chart
        text: `${probability}`,
        colorText: compColors[getDiffLevel(keywordInfo["keyword info"]["Competition"]["keyword_difficulty"])], // Color for the probability
      }
    },
    maintainAspectRatio: false,
    cutout: '70%'  // Adjust this for a thicker/thinner doughnut
  };

  return (
    <div className={styles.difficultyCircle}>
      <Doughnut data={data} options={options} />
    </div>
  );
}


function CompetitionIndexLine(){
  return (
    <div  className={styles.competitionIndexLine}>
      <CarrotSlider value={keywordInfo["keyword info"]["Competition"]["Competition"]} />
    </div>
  );
}


function CarrotSlider({ value }) {
  try{

    const containerStyles = {
      height: '50px',
      width: '100%',
      backgroundColor: "#e0e0de",
      borderRadius: '8px',
      position: 'relative',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      overflow: 'visible'  // Allow elements to be visible outside the container
    };
  
    const fillerStyles = {
      height: '100%',
      width: `${value * 100}%`,
      backgroundColor: compColors[keywordInfo["keyword info"]["Competition"]["competition_level"]],
      borderRadius: 'inherit',
      textAlign: 'right',
      transition: 'width 0.5s ease-in-out'
    };
  
    const labelStyles = {
      position: 'absolute',  // Position the label absolutely relative to its nearest positioned ancestor
      top: '-64px',  // Position above the carrot
      left: `calc(${value * 100}% - 24px)`,  // Center the label above the carrot
      fontSize: "28px",
      color: compColors[keywordInfo["keyword info"]["Competition"]["competition_level"]],
      fontWeight: 'bold',
      transition: 'left 0.5s ease-in-out'
    };
  
    const carrotStyles = {
      width: '0px',
      height: '0px',
      borderLeft: '10px solid transparent',
      borderRight: '10px solid transparent',
      borderTop: `20px solid ${compColors[keywordInfo["keyword info"]["Competition"]["competition_level"]]}`, // Same color as the filler
      position: 'absolute',
      top: '-20px',  // Position on top of the bar
      left: `calc(${value * 100}% - 10px)`, // Centers the carrot above the current value position.
      transition: 'left 0.5s ease-in-out'
    };
  
    return (
      <div style={containerStyles}>
        <div style={fillerStyles}></div>
        <div style={carrotStyles}></div>
        <div style={labelStyles}>{value.toFixed(1)}</div>
      </div>
    );
  } catch {
    return (
      <div >
        No data available.
      </div> )
  }
}


function GenderGraph() {
  const data = {
    labels: ['Female', 'Male'],
    datasets: [{
      label: 'Gender Distribution',
      data: [demography["Demography"]["Gender"]["female"], demography["Demography"]["Gender"]["male"]],  // Values from your JSON
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)'
      ],
      borderWidth: 1
    }]
  };

  const options = {
    plugins: {
      legend: {
        display: false  // Hides the legend
      }
    },
    scales: {

    }
  };

  return (
    <div className={styles.genderGraph}>
      <Bar data={data} options={options} />
    </div>
  );
}

function AgeGraph() {
  const data = {
    labels: ['18-24', '25-34', '35-44', '45-54', '55-64'],
    datasets: [{
      label: 'Age Distribution',
      data: [
        demography["Demography"]["Age"]["18-24"],
        demography["Demography"]["Age"]["25-34"],
        demography["Demography"]["Age"]["35-44"],
        demography["Demography"]["Age"]["45-54"],
        demography["Demography"]["Age"]["55-64"],
      ],  // Values from your JSON
      backgroundColor: [
        'rgba(75, 192, 192, 0.2)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
    }]
  };

  const options = {
    plugins: {
      legend: {
        display: false  // Hides the legend
      }
    },    
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className={styles.ageGraph}>
      <Bar data={data} options={options} />
    </div>
  );
}

function GeographyGraph() {
  try{

      const topCountries = demography.Geography.sort((a, b) => b.value - a.value).slice(0, 25);
    
      const data = {
        labels: topCountries.map(geo => geo.geo_id),
        datasets: [{
          label: 'Country Value Distribution',
          data: topCountries.map(geo => geo.value),
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        }]
      };
    
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += context.raw;
                return label;
              },
              title: function(tooltipItems) {
                return topCountries[tooltipItems[0].dataIndex].geo_name;
              }
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      };
    
      return (
        <div className={styles.geographyGraph}>
          <Bar data={data} options={options} />
        </div>
      );
  } catch {
    return (
      <div className={styles.geographyGraph} style={{textTransform: "none"}}>
        Unable to display Geography Data. This is most likely due to a typo in the keyword.
      </div>
    )
  }
}
function RelatedKeywordsList(){
  return (
    <div className={styles.relatedKeywordsList}>      
        <div className={styles.relatedKeywordLabelsContainer}>
            <div className={styles.relatedKeywordLabelCol}>Keyword</div>
            <div className={styles.relatedKeywordLabelCol}>Search Volume</div>
            <div className={styles.relatedKeywordLabelCol}>CPC</div>
            <div className={styles.relatedKeywordLabelCol}>Competition Level</div>
            <div className={styles.relatedKeywordLabelCol}>Competition</div>
            <div className={styles.relatedKeywordLabelCol}>Low Top of Page Bid</div>
            <div className={styles.relatedKeywordLabelCol}>High Top of Page Bid</div>
            <div className={styles.relatedKeywordLabelCol}>Keyword Difficulty</div>
            <div className={styles.relatedKeywordLabelCol}>Search Intent</div>
        </div>
        
      {relatedKeywords.array.map((item, index) => (
                <div key={index} className={styles.relatedKeywordContainer}>
                  {item.Keyword ?
                    <div className={styles.relatedKeywordCol}>{item.Keyword}</div>:<div className={styles.relatedKeywordCol}>N.A</div>
                  }
                  {item['Search Volume'] ?
                    
                    <div className={styles.relatedKeywordCol}>{item['Search Volume'].toLocaleString()}</div>:<div className={styles.relatedKeywordCol}>N.A</div>
                  } 
                  {
                    item.CPC ?
                    <div className={styles.relatedKeywordCol}>${item.CPC}</div>:<div className={styles.relatedKeywordCol}>N.A</div>
                  }
                  {
                    item['Competition Level'] ?
                    <div className={styles.relatedKeywordCol} style={{textTransform: "uppercase", color: `var(--${item['Competition Level']})`}}>{item['Competition Level']}</div>:<div className={styles.relatedKeywordCol}>N.A</div>
                  }
                  {
                    item['Competition Level']?
                    <div className={styles.relatedKeywordCol} style={{color: `var(--${item['Competition Level']})`}}>{item.Competition}</div>:<div className={styles.relatedKeywordCol}>N.A</div>
                  }
                  {
                    item['Low Top of Page Bid'] ?
                    <div className={styles.relatedKeywordCol}>${item['Low Top of Page Bid']}</div>:<div className={styles.relatedKeywordCol}>N.A</div>
                  }
                  {
                    item['High Top of Page Bid']?
                    <div className={styles.relatedKeywordCol}>${item['High Top of Page Bid']}</div>:<div className={styles.relatedKeywordCol}>N.A</div>
                  }
                  {
                    item['Competition Level']?
                    <div className={styles.relatedKeywordCol} style={{color: `var(--${item['Competition Level']})`}}>{item['Keyword Difficulty']}</div>:<div className={styles.relatedKeywordCol}>N.A</div>
                  }
                  {
                    item['Search Intent']?
                    <div className={styles.relatedKeywordCol} style={{color: `var(--${item['Search Intent']})`}}>{item['Search Intent']}</div>:<div className={styles.relatedKeywordCol}>N.A</div>
                  }
                </div>
            ))}
    </div>
  )
}
function Display(props){
  return (
    <div className = {styles.DisplayContainer}>
      <div className = {styles.searchBarPostSearch}>
        <PostSearchBar  keyword = {props.keyword} default_country = {props.location} default_country_iso_code = {props.iso_code} onSearch={handleSearch} />
      </div>
      <div className={styles.gridContainer}>
          <div className={`${styles.gridItem} ${styles.basicInfo}`}>
            <DisplayInfoItem 
              label="Search Volume" 
              data = {keywordInfo["keyword info"]["Information"]["search_volume"].toLocaleString()} 
              infoTitle = "average monthly search volume rate"
              infoBody = "Represents the (approximate) number of searches for the given keyword idea on google.com"
              />
            <DisplayInfoItem 
              label="CPC" 
              data = {`$${keywordInfo["keyword info"]["Information"]["cpc"]}`} 
              infoTitle = "cost-per-click"
              infoBody = "Represents the average cost per click (USD) historically paid for the keyword"
              />
            <DisplayInfoItem 
              label="Low Top of Page Bid" 
              data = {`$${keywordInfo["keyword info"]["Information"]["low_top_of_page_bid"]}`} 
              infoTitle="minimum bid for the ad to be displayed at the top of the first page"
              infoBody="Indicates the value greater than about 20% of the lowest bids for which ads were displayed (based on Google Ads statistics for advertisers)
              the value may differ depending on the location specified in a POST request"
              />
            <DisplayInfoItem 
              label="High Top of Page Bid" 
              data = {`$${keywordInfo["keyword info"]["Information"]["high_top_of_page_bid"]}`}
              infoTitle="maximum bid for the ad to be displayed at the top of the first page"
              infoBody="Indicates the value greater than about 80% of the lowest bids for which ads were displayed (based on Google Ads statistics for advertisers)
              the value may differ depending on the location specified in a POST request"
              />
          </div>
          <div className={`${styles.gridItem} ${styles.Graph}`}>
            <DisplayInfoItem 
              label="Historical Search Volume"
              infoTitle="monthly searches"
              infoBody="Represents the (approximate) number of searches on this keyword idea (as available for the specified time period), targeted to the specified geographic locations"
              />
            <DisplayInfoItem customEl={ResponsiveLineChart}/>

          </div>     
          <div className={`${styles.gridItem} ${styles.searchIntent}`}>
            <DisplayInfoItem 
              label="Search Intent" 
              data = {searchIntent["Intent"]} color = {`var(--${searchIntent["Intent"]})`}
              infoTitle = "search intent data relevant for the specified keyword"
              infoBody=""
              />
            <DisplayInfoItem 
              label="Probability"
              infoTitle = "search intent probability"
              infoBody="100 indicates the highest probability"
              />
            <DisplayInfoItem customEl={SearchIntentCircle}/>

          </div>
          <div className={`${styles.gridItem} ${styles.keywordDifficulty}`}>
            <DisplayInfoItem 
              label="Keyword Difficulty"
              infoTitle="difficulty of ranking in the first top-10 organic results for a keyword"
              infoBody="Indicates the chance of getting in top-10 organic results for a keyword on a logarithmic scale from 0 to 100;
              calculated by analysing, among other parameters, link profiles of the first 10 pages in SERP"
              />
            <DisplayInfoItem customEl={DifficultyCircle}/>
          </div>  
          <div className={`${styles.gridItem} ${styles.competitionLevel}`}>
            <DisplayInfoItem 
              label="Competition Level" 
              data = {keywordInfo["keyword info"]["Competition"]["competition_level"]} color = {`var(--${keywordInfo["keyword info"]["Competition"]["competition_level"]})`}
              infoTitle="competition level"
              infoBody="Represents the relative level of competition associated with the given keyword in paid SERP only;
              possible values: LOW, MEDIUM, HIGH
              if competition level is unknown, the value is null;"
              />
            <DisplayInfoItem 
              label="Competition Index" 
              // data = {keywordInfo["keyword info"]["Competition"]["Competition"]} 
              infoTitle="competition"
              infoBody="represents the relative amount of competition associated with the given keyword;
              the value is based on Google Ads data and can be between 0 and 1 (inclusive)"
              />
            <DisplayInfoItem customEl={CompetitionIndexLine}/>
          </div>  
            
          <div className={`${styles.gridItem} ${styles.gender}`}>
            <DisplayInfoItem 
              label="Gender Demographics"
              infoTitle="keyword popularity rate within the specified gender category"
              infoBody="Using these value you can understand how popular a keyword is within each gender category;
              calculation: we determine the highest popularity value for the relevant keyword across all gender categories, and then express all other values as a percentage of that highest value (100);
              a value of 100 is the highest popularity for the term;
              a value of 0 means there was not enough data for this term"
              />
            <DisplayInfoItem customEl={GenderGraph}/>
          </div>      
          <div className={`${styles.gridItem} ${styles.age}`}>
            <DisplayInfoItem 
              label="Age Demographics"
              infoTitle="keyword popularity rate within the specified age range"
              infoBody="Using these values you can understand how popular a keyword is within each age range;
              calculation: we determine the highest popularity value for the relevant keyword across all age groups, and then express all other values as a percentage of that highest value (100);
              a value of 100 is the highest popularity for the term
              a value of 0 means there was not enough data for this term"
              />
            <DisplayInfoItem customEl={AgeGraph}/>
          </div>                                   
          <div className={`${styles.gridItem} ${styles.geography}`}>
            <DisplayInfoItem 
              label="Geography Breakdown"
              infoTitle="contains data on relative keyword popularity by country"
              infoBody="represents location-specific keyword popularity rate over the specified time range;
              using this value you can understand how popular a keyword is in one location compared to another location;
              calculation: we determine the highest popularity value for the relevant keyword across all locations, and then express all other values as a percentage of that highest value (100);
              a value of 100 is the highest popularity for the term
              a value of 50 means that the term is half as popular
              a value of 0 means there was not enough data for this term"
              />
            <DisplayInfoItem customEl={GeographyGraph}/>
          </div>      
          <div className={`${styles.gridItem} ${styles.relatedKeywords}`}>
            <DisplayInfoItem 
              label="Related Keywords"
              infoTitle="list of related keywords"
              infoBody="represents the list of search queries which are related to the keyword returned in the array above"
              />
            <DisplayInfoItem customEl={RelatedKeywordsList}/>
          </div>               
      </div>
    </div>
  )
}



// function parseQueryString(queryString) {
//   // Create a URLSearchParams object from the query string
//   const params = new URLSearchParams(queryString);

//   // Object to store the values of required parameters
//   let result = {};

//   // List of keys to extract values for
//   const keys = ['keyword', 'location'];

//   // Track if any of the requested keys are found
//   let flag = false;

//   // Loop through the keys and check if they are present
//   keys.forEach(key => {
//     if (params.has(key)) {
//       result[key] = params.get(key);
//     } else {
//       flag=true
//     }
//   });

//   return flag? false : result;
// }

export default function Home() {

  
  // const queryString = window.location.href
  // const keywords_location = parseQueryString(queryString, ['keyword', 'location'])

  const [status, setStatus] = useState(null); 
  
  
  const [open, setOpen] = useState(false);
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setStatus('search'); // Reset the status to allow user to retry
  };






  useEffect(() => {



    // Function to parse URL search parameters
    const checkUTMParams = () => {
      const params = new URLSearchParams(window.location.search);
      const keyword = params.get('keyword');
      const location = params.get('location');
      const iso_code = params.get('iso_code');

      if (keyword && location && iso_code) {
        
        handleSearch(keyword, location, iso_code)
        //setStatus('loading'); // Set to display immediately if both UTM parameters are present
      } else {

        
        setStatus('search')
      }
    };

    checkUTMParams();
  }, []);  
    
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'none',
    border: 'none',
    boxShadow: 0,
    p: 4,
    '&:focus-visible': {  // This targets the focus-visible pseudo-class
      outline: 'none'  // Removing the outline
    }
  };
  const handleSearch = async (keyword, location, iso_code) => {
    setStatus('loading'); // Switch to loading component
    event.preventDefault(); // Prevent form submission from reloading the page
    let data = { "keyword": keyword, "location": location, "iso_code": iso_code };
    const cacheKey = JSON.stringify(data); // Create a unique key for local storage based on input


    lastSearchedISOCode = iso_code
    lastSearchedCountry = location
    localStorage.setItem("ISO_and_country", JSON.stringify({"iso":iso_code, "location":location}))
  
    // Check if data is already in local storage
    const cachedData = JSON.parse(localStorage.getItem(cacheKey));
    if (cachedData) {
      keywordInfo = cachedData["keywordInfo"];
      searchIntent = cachedData["searchIntent"];
      demography = cachedData["demography"];
      relatedKeywords = cachedData["relatedKeywords"];
      searchQueerieInfo = cachedData["searchQueerieInfo"];
      setStatus('display'); // Move to display after using cached data
      return;
    }

  
    // Configure AWS
    const region = 'us-west-1'; // Set your AWS region
    const credentials = fromCognitoIdentityPool({
      client: new CognitoIdentityClient({ region }),
      identityPoolId: 'us-west-1:baa11292-0fb5-453c-98f6-537c1ba010b8', // Replace with your Identity Pool ID
    });
  
    // Initialize Lambda
    const lambda = new LambdaClient({ region, credentials });
  
    const payloads = [
      {
        sandbox: false,
        page: "keywords-analyze-volume-history",
        args: {
          keyword: keyword,
          location_name: location,
          language_code: "en"
        }
      },
      {
        sandbox: false,
        page: "keywords-analyze-search-intent",
        args: {
          keyword: keyword,
          location_name: location,
          language_code: "en"
        }
      },
      {
        sandbox: false,
        page: "keywords-analyze-trends-data",
        args: {
          keyword: keyword,
          location_name: location,
          language_code: "en"
        }
      },
      {
        sandbox: false,
        page: "keywords-analyze-related-keywords",
        args: {
          keyword: keyword,
          location_name: location,
          language_code: "en"
        }
      }
    ];
  
    try {
      const lambdaPromises = payloads.map(event => {
        const command = new InvokeCommand({
          FunctionName: 'arn:aws:lambda:us-west-1:058264249729:function:APIMiddleWare',
          InvocationType: 'RequestResponse',
          Payload: JSON.stringify(event)
        });
        return lambda.send(command);
      });
      let masterStorageItem = {};
      const responses = await Promise.all(lambdaPromises);
      responses.forEach((response, index) => {
        // Convert Uint8Array to string
        const payloadString = new TextDecoder('utf-8').decode(response.Payload);
      
        try {
          const result = JSON.parse(payloadString);
          global.completeLoad()
          switch (index) {
            case 0:
              keywordInfo = JSON.parse(result["body"]);
              if (keywordInfo == null || keywordInfo["keyword info"] == null){
                throw new Error("Keyword Info is Unavailable");
                
              }
              masterStorageItem["keywordInfo"] =keywordInfo; // Cache the results
              
              
              searchQueerieInfo = keywordInfo["search queerie info"]
              

              masterStorageItem["searchQueerieInfo"] =searchQueerieInfo // Cache the results

              break;
            case 1:
              searchIntent = JSON.parse(result["body"]);
              
              masterStorageItem["searchIntent"] =searchIntent
              break;
            case 2:
              demography = JSON.parse(result["body"]);
              
              masterStorageItem["demography"] =demography
              break;
            case 3:
              
              relatedKeywords = JSON.parse(result["body"]);
              
              masterStorageItem["relatedKeywords"] =relatedKeywords
              break;
            default:
          }
          localStorage.setItem(cacheKey, JSON.stringify(masterStorageItem));

        } catch (error) {
          console.error('Error parsing JSON:', error);
          throw new Error("Keyword Info is Unavailable");

        }
      });
      console.log('All Lambda functions completed');
      setStatus('display');

    } catch (err) {
      

      console.error('Error invoking Lambda functions:', err);

      //popup window here
      handleOpen(); // Open modal on error
      //window.location.href = `/dashboard/keywords`;

      setStatus('search');
    }
  };
  
  return(
    <div>
      
      {status === 'search' && <Search  />}
      
      {status === 'loading' && <Loading />}
      {status === 'display' && <Display />}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="error-modal-title"
        aria-describedby="error-modal-description"
        
      >
        <Box sx={style}>
          <Alert severity="error" onClose={handleClose}>
            <Typography id="error-modal-title" variant="h6">
              Invalid Keyword Entered
            </Typography>
            <Typography id="error-modal-description" sx={{ mt: 2 }}>
              It seems there was an error with your search, likely due to a typo in the keyword or not enough data in the specified location. Please check your input and try again.
            </Typography>
          </Alert>
          {/* <Button onClick={handleClose} style={{ marginTop: 20 }}>Close</Button> */}
        </Box>
      </Modal>
    </div>
  )
}