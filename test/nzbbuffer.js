"use strict";

var assert = require("assert");
var Newbz = require('../lib/nzbbuffer');

describe('NZB Buffered Generator', function() {
	it('should basically work', function(done) {
		var data = [];
		var nzb = new Newbz(
			'A <Poster>',
			['alt.binaries.test', 'tildes suck&&&&', '"made up group"'],
			{
				'testing & stuffing around' : 'test value',
				another_tag : '"hello world"'
			},
			function(blob, encoding) {
				data.push(new Buffer(blob, encoding));
			},
			true,
			'utf8'
		);
		
		var file1 = nzb.file('i_am_insane.jpg', 2, null);
		var file2 = nzb.file('Silly&File', 1, null);
		file1.set(0, 123, 'blabla@test.test');
		file2.set(0, 222, 'whoa');
		file1.set(1, 111, 'invalid<name>@place');
		nzb.end();
		
		data = Buffer.concat(data).toString();
		
		// TODO: should parse XML and check that segments are listed under the correct file
		
		if(!data.indexOf('<nzb xmlns="http://www.newzbin.com/DTD/2003/nzb">'))
			throw new Error('Missing NZB tag');
		if(!data.indexOf('<meta type="testing &amp; stuffing around">test value</meta>'))
			throw new Error('Missing 1st meta tag');
		if(!data.indexOf('<meta type="another_tag">&quot;hello world&quot;</meta>'))
			throw new Error('Missing 2nd meta tag');
		if(!data.indexOf('poster="A &lt;Poster&gt;"'))
			throw new Error('Missing poster attrib');
		if(!data.indexOf('subject="Silly&amp;File (1/1)"'))
			throw new Error('Missing subject attrib');
		if(!data.indexOf('<group>&quot;made up group&quot;</group>'))
			throw new Error('Missing particular group');
		if(!data.indexOf(' number="2"'))
			throw new Error('Missing 2nd segment');
		if(!data.indexOf('invalid&lt;name&gt;@place'))
			throw new Error('Missing 2nd segment ID');
		if(!data.indexOf('>whoa<'))
			throw new Error('Missing 3rd segment ID');
		if(!data.indexOf('</file><file '))
			throw new Error('Missing file start/end');
		if(!data.indexOf('</nzb>'))
			throw new Error('Missing NZB close tag');
		
		// doesn't seem to be any problems otherwise...
		done();
	});
	
	it('should throw if not all segments supplied, or given out of bounds segments', function(done) {
		var data = [];
		var nzb = new Newbz(
			'poster',
			['alt.binaries.test'],
			{},
			function(blob, encoding) {
				data.push(new Buffer(blob, encoding));
			},
			true,
			'utf8'
		);
		
		var file1 = nzb.file('i_am_insane.jpg', 2, null);
		assert.throws(function() {
			file1.set(2, 1, 'hehe');
		});
		assert.throws(function() {
			nzb.end();
		});
		
		done();
	});
	
});
