const { combineRgb } = require('@companion-module/base')

const standardOptions = [
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
				    id: 'playstate',
				    type: 'dropdown', 
			    	label: 'State',
			    	choices: [
			        	{ id: 'playing', label: 'playing' },
			        	{ id: 'loaded', label: 'loaded' },
			        	{ id: 'unloaded', label: 'unloaded' },
			    	],
			    	default: 'playing'
        },]

module.exports = function compileFeedbackDefinitions(self) {
	return {
		TemplateFeedback: {
			name: 'Template feedback',
			type: 'boolean',
			label: 'Template feedback',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
        ...standardOptions, 
        {
				    id: 'template_name',
				    type: 'dropdown', 
			    	label: 'Template',
			    	choices: self.CHOICES_TEMPLATES,
			    	default: ''
        },
			],
			callback: async (feedback, context) => {
				try {
					/*
						"foreground": {
						"file": {
							"path":["file:///opt/CasparCG-server/template/template_name/template_name.html"]
						},
						"paused":[false],
						"producer":["html"]
					} */
					const foreground = self.serverState['channel'][feedback.options.channelid]['stage']['layer'][feedback.options.layerid]['foreground'];

					if(foreground["producer"][0] !== "html")
						return false;  // Not a template 

					if(!foreground["file"]["path"][0].toUpperCase().includes(feedback.options.template_name))
							return false // Wrong template name
				
					if(feedback.options.playstate == 'playing' && !foreground["paused"][0])
						return true
					else if (feedback.options.playstate == 'loaded' && foreground["paused"][0])
						return true
				} catch (err) {
					if (feedback.options.playstate == 'unloaded') {
						return self.serverState['channel'][feedback.options.channelid]['stage']['layer'][feedback.options.layerid]['foreground']['producer'][0] === 'empty'
					}
				}
				return false;
			},
		},
		VideoFeedback: {
			name: 'Video feedback',
			type: 'boolean',
			label: 'Video feedback',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
        ...standardOptions, 
        {
				    id: 'video_name',
				    type: 'dropdown', 
			    	label: 'Video',
			    	choices: self.CHOICES_MEDIAFILES,
			    	default: ''
        },
			],
			callback: async (feedback, context) => {
				/*foreground {
				  file: {
				    clip: [],
				    name: [ 'filnamn.MOV' ],
				    path: [ 'media/filnamn.mov' ],
				    streams: { '0': [Object], '1': [Object], '2': [Object] },
				    time: []
				  },
				  loop: [ false ],
				  paused: [ false ],
				  producer: [ 'ffmpeg' ]
				}*/
				try {
					const foreground = self.serverState['channel'][feedback.options.channelid]['stage']['layer'][feedback.options.layerid]['foreground'];

					if(foreground["producer"][0] !== "ffmpeg")
						return false;  // Not a ffmpeg file, needs to fix this to all video format  

					if(!foreground["file"]["path"][0].toUpperCase().includes(feedback.options.video_name))
							return false // Wrong video name
				
					if(feedback.options.playstate == 'playing' && !foreground["paused"][0])
						return true
					else if (feedback.options.playstate == 'loaded' && foreground["paused"][0])
						return true
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
