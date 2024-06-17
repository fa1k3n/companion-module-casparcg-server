module.exports = function compileVariableDefinitions(self) {
	const variables = []
	const values = []

	// Static variables
	variables.push( { variableId: 'connected', name: 'connected' } );

	// Dynamic variables	
	var nof_channels = 0
	for(channel in self.serverState["channel"]) {
		nof_channels ++;
		
		variables.push({ variableId: `ch${channel}_format`, name: `ch${channel}_format` })
		variables.push({ variableId: `ch${channel}_framerate`, name: `ch${channel}_framerate` })
		
		values[`ch${channel}_format`] = self.serverState["channel"][channel]["format"][0]
		values[`ch${channel}_framerate`] = self.serverState["channel"][channel]["framerate"][0]
	}

	variables.push( { variableId: 'nofChannels', name: 'Number Of Channels' } );
	values['nofChannels'] = nof_channels;

	self.setVariableDefinitions(variables)
	self.setVariableValues(values)	
	return variables
}