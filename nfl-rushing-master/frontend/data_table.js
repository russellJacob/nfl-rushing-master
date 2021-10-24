'use strict';

//Create a class for displaying the players in a table
class Table extends React.Component {
	constructor(props) {
		super(props);

		this.state = {table_content: [], option_bar: 'try'};

	}

	componentDidMount() {
		//Fetch data to put in table initially (when fetch request succeeds)
		fetch("http://localhost:8080/getTable").then(result => result.json()).then(result => {
			this.setState({table_content: result});
		});
	}

	//Trigger a new sql query when user selects a different sorting option
	optionChange = (event) => {
		var eventID = event.target.value;

		//Use the option selected to get the new correctly sorted data from the server
		fetch("http://localhost:8080/" + eventID).then(result => result.json()).then(result => {
			this.setState({table_content: result, option_bar: eventID});
		});
	}

	search = (event) => {
		var text = document.getElementById("search_bar").value;

		//Use the text given AND the option selected to get the new data from the server
		fetch("http://localhost:8080/" + this.state.option_bar + "/" + text.replace(' ', '+')).then(result => result.json()).then(result => {
			this.setState({table_content: result});
		});
	}

	getCSV = (event) => {
		//Generate the CSV file
		var csvFormatted = "Player, Team, Pos, Att, Att/G, Yds, Avg, Yds/G, TD, Lng, 1st, 1st%, 20+, 40+, FUM\n" + this.state.table_content.map(val => Object.values(val).slice(1, Object.values(val).length).join(',')).join('\n');
		var blob = new Blob([csvFormatted], {type: 'text/csv'});
		var csvAddress = window.URL.createObjectURL(blob);
		
		//Trigger the download action
		var downloadLink = document.createElement('a');
		downloadLink.href = csvAddress;
		downloadLink.setAttribute('download', 'rushing_data.csv');
		downloadLink.click();
	}

	//Create the layout for the html table
	render() {
		
		return (
			<div>

			<label> Search for a player by name: </label> <br/>
			<input type="text" id="search_bar" placeholder="Filter by player name..."/>
				
			<button style={{padding:"3px 3px",color:"White",border:"none",backgroundColor:"#444444"}} id="button" type="button" onClick={this.search}>Submit Request</button>

			<br/><br/>

			<label> Sort data (ascending) by: </label> <br/>
			<select onChange={this.optionChange} name="SortingOptions" id="sort">
				<option value="try">Total Rushing Yards</option>
				<option value="lr">Longest Rush</option>
				<option value="trt">Total Rushing Touchdowns</option>
			</select>
	
			<br/>
			<br/>
			<br/>

			<button style={{padding:"3px 3px",color:"White",border:"none",backgroundColor:"#444444"}} id="buttonCSV" type="button" onClick={this.getCSV}>Click here to get a copy of the data in CSV format!</button>

			<br/>
			<br/>

			<table style={{backgroundColor:"#333333",fontWeight:"400"}}>
				<thead align="center">
					<tr>
						<th>Player Name</th>
						<th>Team</th>
						<th>Position</th>
						<th>Rushing Attempts</th>
						<th>Avg Rushing Attempts per Game</th>
						<th>Total Rushing Yards</th>
						<th>Avg Rushing Yards per Attempt</th>
						<th>Rushing Yards per Game</th>
						<th>Total Rushing Touchdowns</th>
						<th>Longest Rush (T means touchdown)</th>
						<th>Rushing First Downs</th>
						<th>Rushing First Down Percentage</th>
						<th>Ruhing 20+ Yards Each</th>
						<th>Rushing 40+ Yards Each</th>
						<th>Rushing Fumbles</th>
					</tr>
				</thead>

				<tbody align="center">
				{this.state.table_content.map(res => {
					return (
						<tr key={res.id}>
							<td>{res.Player}</td>
							<td>{res.Team}</td>
							<td>{res.Pos}</td>
							<td>{res.Att}</td>
							<td>{res.Att_G}</td>
							<td>{res.Yds}</td>
							<td>{res.Avg}</td>
							<td>{res.Yds_G}</td>
							<td>{res.TD}</td>
							<td>{res.Lng}</td>
							<td>{res["1st"]}</td>
							<td>{res["1stpc"]}</td>
							<td>{res["20p"]}</td>
							<td>{res["40p"]}</td>
							<td>{res.FUM}</td>
						</tr>
					);
				})}
				</tbody>
			</table>

			</div>
		);
	}
}

//Render the data
ReactDOM.render(
	<Table />,
	document.getElementById('data_table_container')
);