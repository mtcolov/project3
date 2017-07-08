$(document).ready(function(){
	
	// Initial alphabet (without 'j')
	
	var alphabet = "",
	alphabetStr = "abcdefghiklmnopqrstuvwxyz";
	
	// Special character
	
	var specChar = "x";
	
	// Initial keyPhrase
	var keyPhrase = "";
	
	//Convert numbers 0-9 to text function
	function numToText(str) {
		var numArr = str.match(/\d/g),
		numWords = [
		"zero",
		"one",
		"two",
		"three",
		"four",
		"five",
		"six",
		"seven",
		"eight",
		"nine"
		],
		i = 0;
		
		if (!numArr) {
			return str;
		}
		
		for (i = 0; i < numArr.length; i++) {
			regex = new RegExp(numArr[i], "g");
			str = str.replace(regex, numWords[parseInt(numArr[i])]);
		}
		
		return str;
	}
	
	
	//Refresh element
	// function refreshEl(el){
		// var cached = $(this).val();
		// $(el).html(cached);
	// }
	
	
	//Define char position
	function getCharPosition(c) {
		var index = keyPhrase.indexOf(c);
		var row = Math.floor(index / 5);
		var col = index % 5;
		return {
			row: row,
			col: col
		};
	}
	
	//Define char from position
	
	function getCharFromPosition(pos) {
		var index = pos.row * 5;
		index = index + pos.col;
		return keyPhrase.charAt(index);
	}
	
	// Apply Playfair rules to digraphs
	
	function encipherPair(str) {
		if (str.length != 2) return false;
		var pos1 = getCharPosition(str.charAt(0));
		var pos2 = getCharPosition(str.charAt(1));
		var char1 = "";
		
		// Same Column - Increment 1 row, wrap around to top
		if (pos1.col == pos2.col) {
			pos1.row++;
			pos2.row++;
			if (pos1.row > 4) pos1.row = 0;
			if (pos2.row > 4) pos2.row = 0;
			char1 = getCharFromPosition(pos1) + getCharFromPosition(pos2);
			} else if (pos1.row == pos2.row) { // Same Row - Increment 1 column, wrap around to left
			pos1.col++;
			pos2.col++;
			if (pos1.col > 4) pos1.col = 0;
			if (pos2.col > 4) pos2.col = 0;
			char1 = getCharFromPosition(pos1) + getCharFromPosition(pos2);
			} else { // Box rule, use the opposing corners
			var col1 = pos1.col;
			var col2 = pos2.col;
			pos1.col = col2;
			pos2.col = col1;
			char1 = getCharFromPosition(pos1) + getCharFromPosition(pos2);
		}
		
		return char1;
	}
	
	// Encipher digraphs
	
	function encipher(digraph) {
		if (!digraph) return false;
		var cipher = [];
		for (var i = 0; i < digraph.length; i++) {
			cipher.push(encipherPair(digraph[i]));
		}

		return cipher;
	}
	
	// Create digraphs from text
	
	function makeDigraph(str) {
		if (!str) return false;
		var digraph = [];
		var strArr = str.split("");
		
		for (var i = 0; i < str.length; i++) {
			if (alphabetStr.indexOf(strArr[i]) == -1) continue;
			if (i + 1 >= str.length) digraph.push(strArr[i] + specChar);
			else if (strArr[i] == strArr[i + 1]) digraph.push(strArr[i] + specChar);
			else digraph.push(strArr[i] + strArr[++i]);
		}
		
		return digraph;
	}
	
	
	// Print 5x5 alphabet table, starting with passphrase chars
	
	function printKey() {
		var tableHtml = "<table class='table table-condensed'>";
		for (var i = 0; i < 25; i = i + 5) {
			tableHtml += "<tr>";
			var row = keyPhrase.substring(i, i + 5);
			var chars = row.split("");
			for (var x = 0; x < 5; x++) {
				tableHtml += "<td>" + chars[x] + "</td>";
			}
			tableHtml += "</tr>";
		}
		tableHtml += "</table>";
		$("#keyTable").html(tableHtml);
	}
	
	// Generate 5x5 alphabet table, starting with passphrase chars
	
	function createKey(keystr) {
		if (!keystr) {
			keystr = "";
		}
		keystr = numToText(keystr);
		keystr = keystr.toLowerCase().replace(/[^a-z0-9]/g, "").replace("j", "i");
		
		
		keyPhrase = "";
		alphabet = alphabetStr;
		
		var keystrArr = keystr.split("");
		
		$.each(keystrArr, function (x, c) {
			if (alphabet.indexOf(c) > -1 && keyPhrase.indexOf(c) == -1) {
				keyPhrase += c;
				alphabet = alphabet.replace(c, "");
			}
			
		});
		
		keyPhrase += alphabet;
		
	}
	
	
	
	
	// Text to encrypt function
	function TextToEncrypt(text) {
		var i = 0;
		text = numToText(text);
		text = text.split("");
		for (i = 0; i < text.length; i++) {
			if (text[i] === text[i + 1]) {
				text[i] += specChar;
			}
		}
		text = text.join("");
		
		text = text.toLowerCase().replace(/[^a-z0-9]/g, "").replace("j", "i");
		
		text = text.split("");
		
		if (text.length % 2) {
			text.push(specChar);
		}
		
		for (i = 0; i < text.length; i += 2) {
			if (text[i] === text[i + 1]) {
				text[i] += specChar;
			}
		}
		
		if (text.length % 2) {
			text.push(specChar);
		}
		
		return text.join("");
		
	}
	
	// Confirm button event
	
	$("#confirm").click(function (e) {
		e.preventDefault();
		createKey($("#passphrase").val());
		var str = $("#passphrase").val();
		if (str === "") {
			$("#passphrase").next().addClass('bg-danger text-red').css("display", "block");
			} else {
			$("#passphrase").next().removeClass('bg-danger text-red').css("display", "none");
			printKey();
			}
		
		
	});
	
	// Encrypt button event
	$("#encrypt").click(function (e) {
	e.preventDefault();
		var str = TextToEncrypt($("#plaintext").val());
		
		if (!str) {
		$("#plaintext").next().addClass('bg-danger text-red').css("display", "block");
		} else {
		$("#plaintext").next().removeClass('bg-danger text-red').css("display", "none");
		var digraph = makeDigraph(str);
		var cipher = encipher(digraph);
		$("#ciphertext").val(cipher.join(""));
		}
		
	});
	$("#passphrase").focus();
});