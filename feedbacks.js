const { combineRgb } = require('@companion-module/base')

module.exports = function compileFeedbackDefinitions(self) {
	return {
		PlayState: {
			name: 'Playstate',
			type: 'boolean',
			label: 'Play State',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					id: 'channelid',
					type: 'textinput',
					label: 'Channel ID',
					'default': "1",
				},
				{
					id: 'layerid',
					type: 'textinput',
					label: 'Layer ID',
					'default': "20",
				},
				{
				    id: 'template_name',
				    type: 'dropdown', 
			    	label: 'Template',
			    	choices: self.CHOICES_TEMPLATES,
			    	default: ''
        		},
				{
				    id: 'playstate',
				    type: 'dropdown', 
			    	label: 'State',
			    	choices: [
			        	{ id: 'playing', label: 'playing' },
			        	{ id: 'loaded', label: 'loaded' },
			        	{ id: 'unloaded', label: 'unloaded' },
			    	],
			    	default: 'playing'
        		},
			],
			callback: async (feedback, context) => {
				try {
					//console.log("SERVER STATE", JSON.stringify(self.serverState))
					
			/*		SERVER STATE 
					{"channel": {
						"1": {
							"format":["1080p5000"],
							"framerate":[50,3276800],
							"mixer": {
								"audio": {
									"volume":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
								}
							},
							"output": {
								"port": {
									"601": {
										"consumer":["screen"],
										"screen": {
											"always_on_top":[false],
											"index":[1],
											"key_only":[false],
											"name":["Fill"]
										}
									},
									"610": {
										"consumer":["screen"],
										"screen":{
											"always_on_top":[false],
											"index":[0],
											"key_only":[true],
											"name":["Key"]
										}
									}
								}
							},
							"stage": {
								"layer": {
									"20": {
										"background": {
											"producer":["empty"]
										},
										"foreground": {
											"file": {
												"path":["file:///opt/CasparCG-server/template/TImer_upper_left/TImer_upper_left.html"]
											},
											"paused":[false],
											"producer":["html"]
										}
									}
								}
							}
						}
					}
				} */

/*foreground {
  file: {
    clip: [],
    name: [ 'FREDRIK_HYPE_FINAL.MOV' ],
    path: [ 'media/Fredrik_hype_final.mov' ],
    streams: { '0': [Object], '1': [Object], '2': [Object] },
    time: []
  },
  loop: [ false ],
  paused: [ false ],
  producer: [ 'ffmpeg' ]
}*/

					if(feedback.options.playstate == 'playing') {
						let foreground = self.serverState['channel'][feedback.options.channelid]['stage']['layer'][feedback.options.layerid]['foreground'];
						console.log("foreground", foreground)
						if(foreground["producer"][0] === "ffmpeg") {
							console.log("STREAMS", JSON.stringify(foreground["file"]["streams"]))
						}
						if(foreground["producer"][0] !== "html" || foreground["paused"][0]) {
							return false;
						}
						if(foreground["file"]["path"][0].toUpperCase().includes(feedback.options.template_name))
							return true
					} else if (feedback.options.playstate == 'loaded') {
						return self.serverState['channel'][feedback.options.channelid]['stage']['layer'][feedback.options.layerid]['foreground']['producer'][0] === 'empty'
					}
				} catch (err) {
					if (feedback.options.playstate == 'unloaded') {
						return self.serverState['channel'][feedback.options.channelid]['stage']['layer'][feedback.options.layerid]['foreground']['producer'][0] === 'empty'
					}
				}
				return false;
			},
		},
	}
}
