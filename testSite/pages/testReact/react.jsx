var src = 'https://facebook.github.io/react/';
var props = {
	'className': 'a',
	'config-b': 'b',
	'data-custom-aa': 'v1',
	'href': 'aaa'
};
// Create a self-defined component via custom variable
var MyComponent = React.createClass({
	getInitialState: function() {
	    return {liked: false};
	  },
	click: function(e){
		// this.setState is an async function
		this.setState({liked: !this.state.liked}, function(){
			console.log('By callBack:' + this.state.toString());
		});
		console.log('By nextCall:' + this.state.toString());
	},
	render: function(){
		var copy = props; // Make sure it in the same scope
		return (
			<p {...copy} onClick={this.click}></p> // Visit the props object via copied object
			);
	}
});
var link = <a {...props}>This is a link!</a>;


ReactDOM.render(
  <MyComponent {...props}>
  	<span>aaaa</span>
  </MyComponent>,
  document.getElementById('example')
);
ReactDOM.render(
  link,
  document.getElementById('example1')
);