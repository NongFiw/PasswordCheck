// passchk.js is free software; you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation; either version 3 of the License, or (at your
// option) any later version.
//
// passchk.js is distributed in the hope that it will be useful but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// General Public License for more details.
//
// The passchk.js archive has a copy of the GNU General Public License,
// but if you did not get it, see <http://www.gnu.org/licenses/>
//
// passchk.js is available from http://rumkin.com/tools/password/passchk.php
//
// Javascript functions for the password checker form

var Common_Words = new Array();
var Frequency_Table = new Array();

// The compression algorithm is very basic - the first letter is upper case,
// and it means to copy X letters from the previous word.  A = 0, B = 1, etc.
// So, if I had "apple apricot banana", it would compress to
// "AappleCricotAbanana". 
function Parse_Common_Word()
{
   var i, c, word;
   
   i = 1;
   c = Common_List.substr(i, 1);
   while (c == c.toLowerCase() && i < Common_List.length)
   {
      i ++;
      c = Common_List.substr(i, 1);
   }
   
   word = Common_List.substr(0, i);
   Common_List = Common_List.substr(i, Common_List.length);
   
   if (word.substr(0, 1) == 'A')
   {
      word = word.substr(1, word.length);
   }
   else
   {
      i = word.charCodeAt(0) - 'A'.charCodeAt(0);
      word = Common_Words[Common_Words.length - 1].substr(0, i) +
         word.substr(1, word.length);
   }
   
   Common_Words[Common_Words.length] = word;
}

function Parse_Common()
{
   for (var i = 0; i < 100 && Common_List.length > 0; i ++)
   {
      Parse_Common_Word();
   }
   if (Common_List.length)
   {
      window.setTimeout('Parse_Common()', 20);
   }
   else
   {
      document.Common_Parsed = 1;
   }
}

// The frequency thing is a bit more interesting, but still not too complex.
// Each three letters are base-95 encoded number representing the chance that
// this combination comes next.  Subtract the value of ' ' from each of the
// three, then ((((first_value * 95) + second_value) * 95) + third_value) will
// give you the odds that this pair is grouped together.  The first is "  "
// (non-alpha chars), then " a", " b", etc. " y", " z", "a ", "aa", "ab", and
// so on.  If you decrypt the table successfully, you should see a really large
// number for "qu".
function Parse_Frequency_Token()
{
   var c;
   
   c = Frequency_List.charCodeAt(0) - ' '.charCodeAt(0);
   c /= 95;
   c += Frequency_List.charCodeAt(1) - ' '.charCodeAt(0);
   c /= 95;
   c += Frequency_List.charCodeAt(2) - ' '.charCodeAt(0);
   c /= 95;
   
   Frequency_List = Frequency_List.substr(3, Frequency_List.length);
   
   Frequency_Table[Frequency_Table.length] = c;
}


function Parse_Frequency()
{
   for (var i = 0; i < 100 && Frequency_List.length > 0; i ++)
   {
      Parse_Frequency_Token();
   }
   if (Frequency_List.length)
   {
      window.setTimeout('Parse_Frequency()', 20);
   }
   else
   {
      document.Frequency_Parsed = 1;
   }
}


function Get_Index(c)
{
   c = c.charAt(0).toLowerCase();
   if (c < 'a' || c > 'z')
   {
      return 0;
   }
   return c.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
}


function Get_Charset_Size(pass)
{
   var a = 0, u = 0, n = 0, ns = 0, r = 0, sp = 0, s = 0, chars = 0;
   
   for (var i = 0 ; i < pass.length; i ++)
   {
      var c = pass.charAt(i);
      
      if (a == 0 && 'abcdefghijklmnopqrstuvwxyz'.indexOf(c) >= 0)
      {
         chars += 26;
	 a = 1;
      }
      if (u == 0 && 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(c) >= 0)
      {
         chars += 26;
	 u = 1;
      }
      if (n == 0 && '0123456789'.indexOf(c) >= 0)
      {
         chars += 10;
	 n = 1;
      }
      if (ns == 0 && '!@#$%^&*()'.indexOf(c) >= 0)
      {
         chars += 10;
	 ns = 1;
      }
      if (r == 0 && "`~-_=+[{]}\\|;:'\",<.>/?".indexOf(c) >= 0)
      {
         chars += 20;
	 r = 1;
      }
      if (sp == 0 && c == ' ')
      {
         chars += 1;
	 sp = 1;
      }
      if (s == 0 && (c < ' ' || c > '~'))
      {
         chars += 32 + 128;
	 s = 1;
      }
   }
   
   return chars;
}


function Set_Text(s)
{
   var e;
   
   if (! document.getElementById)
   {
      return;
   }
   
   e = document.getElementById('passchk_result');
   if (! e)
   {
      return;
   }
   
   if (e.innerHTML == s)
   {
      return;
   }
   
   e.innerHTML = s;
}


var OldPass = -1;
function ShowStats()
{
   var pass = document.passchk_form.passchk_pass.value;
   var plower = pass.toLowerCase();
   var r = "";
   
   if (pass == OldPass)
   {
      window.setTimeout('ShowStats();', 200);
      return;
   }
   OldPass = pass;
   
   if (pass.length == 0)
   {
      Set_Text("Enter a password to see its strength.");
      UpdateStrengthMeter(0);
      try { renderCrackTimes(0); } catch(e) {}
      try { renderBreakdown('', 0); } catch(e) {}
      window.setTimeout('ShowStats();', 200);
      return;
   }
   
   if (pass.length <= 4)
   {
      r += "<b>WARNING:  <font color=red>Very short password!</font></b><br>\n";
   }
   else if (pass.length < 8)
   {
      r += "<b>WARNING:</b>  <font color=red>Short password!</font><br>\n";
   }
   
   // First, see if it is a common password.
   for (var i = 0; i < Common_Words.length; i ++)
   {
      if (Common_Words[i] == plower)
      {
         i = Common_Words.length;
	 r += "<b>WARNING:  <font color=red>Common password!</font></b><br>\n";
      }
   }
   
   r += "<b>Length:</b>  " + pass.length + "<br>\n";
   // Calculate frequency chance
   if (pass.length > 1)
   {
      var c, aidx = 0, bits = 0, charSet;
      charSet = Math.log(Get_Charset_Size(pass)) / Math.log(2);
      aidx = Get_Index(plower.charAt(0));
      for (var b = 1; b < plower.length; b ++)
      {
	 var bidx = Get_Index(plower.charAt(b));
	 c = 1.0 - Frequency_Table[aidx * 27 + bidx];
	 bits += charSet * c * c;  // Squared = assmume they are good guessers
	 aidx = bidx;
      }
      
      if (bits < 28)
      {
         r += "<b>Strength:  <font color=red>Very Weak</font></b> - ";
	 r += "Try making your password longer, including CAPITALS, or ";
	 r += "adding symbols.<br>\n";
      }
      else if (bits < 36)
      {
         r += "<b>Strength:</b>  <font color=red>Weak</font> - ";
	 r += "Usually good enough for computer login passwords and to ";
	 r += "keep out the average person.<br>\n";
      }
      else if (bits < 60)
      {
         r += "<b>Strength:</b>  <font color=brown>Reasonable</font> - ";
	 r += "This password is fairly secure cryptographically and ";
	 r += "skilled hackers may need some good computing power to ";
	 r += "crack it.  (Depends greatly on implementation!)<br>\n";
      }
      else if (bits < 128)
      {
         r += "<b>Strength:</b>  <font color=green>Strong</font> - ";
	 r += "This password is typically good enough to safely guard ";
	 r += "sensitive information like financial records.<br>\n";
      }
      else
      {
         r += "<b>Strength:</b>  <font color=blue>Very Strong</font> - ";
	 r += "More often than not, this level of security is overkill.<br>\n";
      }
      r += "<b>Entropy:</b>  " + (Math.round(bits * 10) / 10) + " bits<br>\n";
      r += "<b>Charset Size:</b>  " + Get_Charset_Size(pass) + 
         " characters<br>\n";
      // update visual meter, crack-time estimates and breakdown
      try { UpdateStrengthMeter(bits); } catch(e) {}
      try { renderCrackTimes(bits); } catch(e) {}
      try { renderBreakdown(pass, bits); } catch(e) {}
      try { updatePreview(); } catch(e) {}
   }
   
   Set_Text(r);
   
   window.setTimeout('ShowStats();', 200);
}


function CheckIfLoaded()
{
   var s = "";
   if (! document.Common_Loaded)
   {
      s += "Loading common passwords...<br>\n";
   }
   else if (! document.Common_Parsed)
   {
      if (! document.Common_Parsed_Started)
      {
         window.setTimeout('Parse_Common()', 50);
	 document.Common_Parsed_Started = 1;
      }
      s += "Parsing common passwords... " + 
         Common_List.length + "<br>\n";
   }
   if (! document.Frequency_Loaded)
   {
      s += "Loading letter frequency table...<br>\n";
   }
   else if (! document.Frequency_Parsed)
   {
      if (! document.Frequency_Parsed_Started)
      {
         window.setTimeout('Parse_Frequency()', 50);
	 document.Frequency_Parsed_Started = 1;
      }
      s += "Parsing frequency table... " + 
         Frequency_List.length + "<br>\n";
   }
   if (s != "")
   {
      Set_Text(s + "Loading ...");
      window.setTimeout('CheckIfLoaded()', 200);
      return;
   }
   
   // Loaded. Do initialization thingies.
   Set_Text("Finished Loading.");
   window.setTimeout('ShowStats();', 1000);
}

window.setTimeout('CheckIfLoaded()', 100);

/* --- UI helpers: strength meter, generate & copy --- */
function UpdateStrengthMeter(bits)
{
   var bar = document.getElementById('strengthBar');
   var label = document.getElementById('strengthLabel');
   if (! bar) return;
   var max = 128;
   var val = 0;
   if (typeof bits === 'number') val = Math.max(0, Math.min(bits, max));
   var pct = (val / max) * 100;
   bar.style.width = pct + '%';
   var color;
   if (bits < 28) color = '#ff5656';
   else if (bits < 36) color = '#ff8a56';
   else if (bits < 60) color = '#ffd166';
   else if (bits < 128) color = '#6bd36b';
   else color = '#4da6ff';
   bar.style.background = color;
   if (label)
   {
      // Remove duplicate bits display: entropy is already shown
      // in the main stats panel, so keep the strength label empty.
      label.innerHTML = '';
   }
}

function generatePassword(len)
{
   // Strong password generator: ensure mixed classes and avoid simple patterns.
   len = len || 25;
   var lower = "abcdefghijklmnopqrstuvwxyz";
   var upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
   var digits = "0123456789";
   var symbols = "!@#$%^&*()-_+=[]{}|;:,.<>?/";

   function shuffleArray(a) {
      for (var i = a.length - 1; i > 0; i--) {
         var j = Math.floor(Math.random() * (i + 1));
         var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
   }

   function computeBitsFor(pass) {
      // Try to compute bits using the same frequency-based algorithm as ShowStats
      try {
         if (!pass || pass.length <= 1) return 0;
         var plower = pass.toLowerCase();
         var aidx = Get_Index(plower.charAt(0));
         var bits = 0;
         var charSet = Math.log(Get_Charset_Size(pass)) / Math.log(2);
         for (var b = 1; b < plower.length; b++) {
            var bidx = Get_Index(plower.charAt(b));
            var c = 1.0 - Frequency_Table[aidx * 27 + bidx];
            bits += charSet * c * c;
            aidx = bidx;
         }
         return bits;
      } catch (e) {
         // fallback to naive estimate
         var cs = Get_Charset_Size(pass);
         return pass.length * (Math.log(cs) / Math.log(2));
      }
   }

   var attempt = 0; var pass = '';
   while (attempt < 1000) {
      attempt++;
      var parts = [];
      // ensure at least one of each class
      parts.push(lower.charAt(Math.floor(Math.random()*lower.length)));
      parts.push(upper.charAt(Math.floor(Math.random()*upper.length)));
      parts.push(digits.charAt(Math.floor(Math.random()*digits.length)));
      parts.push(symbols.charAt(Math.floor(Math.random()*symbols.length)));
      // fill the rest
      var all = lower + upper + digits + symbols;
      for (var i = parts.length; i < len; i++) parts.push(all.charAt(Math.floor(Math.random()*all.length)));
      shuffleArray(parts);
      pass = parts.join('');

      // avoid long repeats and sequences
      if (maxRepeatRun(pass) >= 4) continue;
      if (containsSequential(pass, 4)) continue;

      // avoid common words inside
      var plower = pass.toLowerCase();
      var bad = false;
      try {
         for (var i = 0; i < Common_Words.length; i++) {
            var w = Common_Words[i];
            if (w && w.length >= 4 && plower.indexOf(w) !== -1) { bad = true; break; }
         }
      } catch(e) { }
      if (bad) continue;

      // compute bits and analyze
      var bits = computeBitsFor(pass);
      var issues = analyzePassword(pass, bits);
      // accept only if no critical/warning issues
      var accept = true;
      for (var k = 0; k < issues.length; k++) {
         if (issues[k].severity === 'critical' || issues[k].severity === 'warning') { accept = false; break; }
      }
      if (accept && bits >= 60) break;
   }

   document.passchk_form.passchk_pass.value = pass;
   try { ShowStats(); } catch(e) {}
   try { checkPwned(); } catch(e) {}
}

function copyPassword()
{
   var pass = document.passchk_form.passchk_pass.value;
   if (! pass) return;
   if (navigator.clipboard && navigator.clipboard.writeText)
   {
      navigator.clipboard.writeText(pass).catch(function(){});
   }
   else
   {
      var ta = document.createElement('textarea');
      ta.value = pass; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch(e) {}
      document.body.removeChild(ta);
   }
}

function toggleShowPassword()
{
   try {
      var input = document.getElementById('passchk_pass');
      var btn = document.getElementById('toggleShowBtn');
      var preview = document.getElementById('passchk_preview');
      if (!input || !btn || !preview) return;
      var pressed = btn.getAttribute('aria-pressed') === 'true';
      if (!pressed)
      {
         // show preview overlay (do NOT change input.type)
         btn.innerText = 'Hide';
         btn.setAttribute('aria-pressed','true');
         btn.setAttribute('aria-label','Hide password');
         // hide the native masked characters by making text transparent
         // use text color and webkit text fill so the input box (border/background)
         // remains visible but the bullets/dots are not shown.
         try { input.style.color = 'transparent'; } catch(e) {}
         try { input.style.webkitTextFillColor = 'transparent'; } catch(e) {}
         // keep caret visible where supported
         try { input.style.caretColor = '#111'; } catch(e) {}
         preview.style.display = 'block';
         preview.textContent = input.value;
         // keep preview updated while typing
         input.addEventListener('input', updatePreview);
      }
      else
      {
         // hide preview
         btn.innerText = 'Show';
         btn.setAttribute('aria-pressed','false');
         btn.setAttribute('aria-label','Show password');
         preview.style.display = 'none';
         try { input.removeEventListener('input', updatePreview); } catch(e) {}
         // restore input appearance (clear the color overrides)
         try { input.style.color = ''; } catch(e) {}
         try { input.style.webkitTextFillColor = ''; } catch(e) {}
         try { input.style.caretColor = ''; } catch(e) {}
      }
   } catch(e) { }
}

function updatePreview()
{
   try {
      var input = document.getElementById('passchk_pass');
      var btn = document.getElementById('toggleShowBtn');
      var preview = document.getElementById('passchk_preview');
      if (!input || !btn || !preview) return;
      if (btn.getAttribute('aria-pressed') === 'true')
      {
         preview.style.display = 'block';
         preview.textContent = input.value;
      }
      else
      {
         preview.style.display = 'none';
      }
   } catch(e) {}
}

/* --- Time-to-crack estimations --- */
function secondsFromBits(bits, rate)
{
   // bits -> expected attempts ~ 2^(bits-1); time (s) = attempts / rate
   if (bits <= 0) return 0;
   var exp = bits - 1;
   // use log-check to avoid overflow
   var log10sec = exp * Math.LOG10E * Math.log(2) - Math.log10(rate);
   var maxSafeLog10 = 308; // Number.MAX_VALUE ~1e308
   if (log10sec > maxSafeLog10)
   {
      return Infinity;
   }
   var seconds = Math.pow(2, exp) / rate;
   return seconds;
}

function humanReadableDuration(seconds)
{
   if (!isFinite(seconds)) return '> 1e308 seconds';
   if (seconds < 1) return '< 1 second';
   var units = [
      ['year', 3600 * 24 * 365],
      ['day', 3600 * 24],
      ['hour', 3600],
      ['minute', 60],
      ['second', 1]
   ];
   for (var i = 0; i < units.length; i++)
   {
      var name = units[i][0], div = units[i][1];
      if (seconds >= div)
      {
         var v = seconds / div;
         if (v >= 365 && name === 'year')
         {
            // show scientific for enormous values
            if (v > 1e6) return (v/1e6).toFixed(2) + ' million years';
            if (v > 1e3) return Math.round(v) + ' years';
         }
         return (v >= 10 ? Math.round(v) : (Math.round(v * 10) / 10)) + ' ' + name + (v >= 2 ? 's' : '');
      }
   }
   return Math.round(seconds) + ' seconds';
}

function estimateCrackTimes(bits)
{
   var rates = [
      {label: 'Online attacker (limited)', rate: 1e3},
      {label: 'Fast online / botnet', rate: 1e6},
      {label: 'Single GPU (offline)', rate: 1e9},
      {label: 'Cluster / small ASIC farm', rate: 1e12},
      {label: 'Large supercomputer/ASIC farm', rate: 1e15}
   ];
   var res = [];
   for (var i = 0; i < rates.length; i++)
   {
      var s = secondsFromBits(bits, rates[i].rate);
      res.push({label: rates[i].label, rate: rates[i].rate, seconds: s, text: humanReadableDuration(s)});
   }
   return res;
}

function renderCrackTimes(bits)
{
   var el = document.getElementById('crackTimes');
   if (! el) return;
   if (! bits || bits <= 0)
   {
      el.innerHTML = '';
      return;
   }
   var arr = estimateCrackTimes(bits);
   var html = '<strong>Estimated time to crack (average):</strong>' +
      '<ul>';
   for (var i = 0; i < arr.length; i++)
   {
      html += '<li>' + arr[i].label + ': <strong>' + arr[i].text + '</strong></li>';
   }
   html += '</ul>';
   el.innerHTML = html;
}

/* --- Strength breakdown and suggestions --- */
function containsSequential(pass, minLen)
{
   if (!pass) return false;
   var maxRun = 1, run = 1;
   for (var i = 1; i < pass.length; i++)
   {
      if (pass.charCodeAt(i) - pass.charCodeAt(i-1) === 1) run++; else run = 1;
      if (run > maxRun) maxRun = run;
   }
   return maxRun >= minLen;
}

function maxRepeatRun(pass)
{
   if (!pass) return 0;
   var max = 1, cur = 1;
   for (var i = 1; i < pass.length; i++)
   {
      if (pass.charAt(i) === pass.charAt(i-1)) cur++; else cur = 1;
      if (cur > max) max = cur;
   }
   return max;
}

function analyzePassword(pass, bits)
{
   var plower = pass.toLowerCase();
   var issues = [];
   if (pass.length < 8)
   {
      issues.push({severity:'critical', title:'Short length', detail:'Password is shorter than 8 characters', action:'increase_length'});
   }

   // charset checks
   var hasLower = /[a-z]/.test(pass);
   var hasUpper = /[A-Z]/.test(pass);
   var hasDigit = /[0-9]/.test(pass);
   var hasSymbol = /[^A-Za-z0-9\s]/.test(pass);
   if (!hasUpper) issues.push({severity:'warning', title:'No uppercase letters', detail:'Adding uppercase letters increases charset and entropy', action:'add_upper'});
   if (!hasDigit) issues.push({severity:'warning', title:'No digits', detail:'Adding digits increases complexity', action:'add_number'});
   if (!hasSymbol) issues.push({severity:'warning', title:'No symbols', detail:'Adding symbols makes passwords harder to guess', action:'add_symbol'});

   var charset = Get_Charset_Size(pass);
   if (charset <= 26 && pass.length > 6)
   {
      issues.push({severity:'warning', title:'Limited character set', detail:'Only one character class detected (lowercase). Consider mixing cases, numbers, and symbols', action:'increase_length'});
   }

   // repeated characters
   var rep = maxRepeatRun(pass);
   if (rep >= 4)
   {
      issues.push({severity:'warning', title:'Repeated characters', detail:'The password contains repeated characters ('+rep+'). Avoid long runs of the same character', action:'randomize'});
   }

   // sequential runs
   if (containsSequential(pass, 4) || containsSequential(plower, 4))
   {
      issues.push({severity:'warning', title:'Sequential characters', detail:'Sequence of characters (e.g., "abcd" or "1234") detected', action:'randomize'});
   }

   // common words (simple substring check for longer words)
   try {
      var isPassphrase = (pass.indexOf(' ') !== -1);
      var passphraseWords = isPassphrase ? pass.trim().split(/\s+/).length : 0;
      for (var i = 0; i < Common_Words.length; i++)
      {
         var w = Common_Words[i];
         if (w && w.length >= 4 && plower.indexOf(w) !== -1)
         {
            if (isPassphrase && passphraseWords >= 3)
            {
               // It's a multi-word passphrase — common words are expected; downgrade to info
               issues.push({severity:'info', title:'Contains common word (passphrase)', detail:'Password contains common words but used as a passphrase', action:null});
            }
            else
            {
               issues.push({severity:'critical', title:'Contains common word', detail:'Password contains a common word: "'+w+'"', action:'use_passphrase'});
            }
            break;
         }
      }
   } catch(e) {}

   // low entropy
   if (bits < 36)
   {
      issues.push({severity:'critical', title:'Low entropy', detail:'Estimated entropy is low ('+Math.round(bits*10)/10+' bits)', action:'increase_length'});
   }
   else if (bits < 60)
   {
      issues.push({severity:'warning', title:'Moderate entropy', detail:'Entropy is moderate ('+Math.round(bits*10)/10+' bits). Consider making it longer or more complex', action:'increase_length'});
   }

   // If no issues found, show positive info
   if (issues.length === 0)
   {
      issues.push({severity:'info', title:'No obvious weaknesses found', detail:'Password looks reasonably strong based on current checks', action:null});
   }

   return issues;
}


function applySuggestion(action)
{
   var f = document.passchk_form;
   var pass = f.passchk_pass.value || '';
   // (layout-conversion helper removed)
   if (action === 'add_symbol')
   {
      f.passchk_pass.value = pass + '!@#'.charAt(Math.floor(Math.random()*3));
   }
   else if (action === 'add_upper')
   {
      // capitalize first lowercase letter or prepend 'A'
      var replaced = false;
      var arr = pass.split('');
      for (var i = 0; i < arr.length; i++)
      {
         if (arr[i] >= 'a' && arr[i] <= 'z') { arr[i] = arr[i].toUpperCase(); replaced = true; break; }
      }
      if (!replaced) arr.unshift('A');
      f.passchk_pass.value = arr.join('');
   }
   else if (action === 'add_number')
   {
      f.passchk_pass.value = pass + '1';
   }
   else if (action === 'increase_length')
   {
      f.passchk_pass.value = pass + 'Ab12';
   }
   else if (action === 'randomize')
   {
      generatePassword(12);
   }
   else if (action === 'use_passphrase')
   {
      // build a simple passphrase from Common_Words if available
      try {
         if (Common_Words.length >= 6)
         {
            var words = [];
            for (var j = 0; j < 4; j++) words.push(Common_Words[Math.floor(Math.random()*Common_Words.length)]);
            f.passchk_pass.value = words.join(' ');
         }
         else
         {
            generatePassword(20);
         }
      } catch(e){ generatePassword(20); }
   }
   // (convert_layout action removed)
   // update view
   try { ShowStats(); } catch(e) {}
}

function renderBreakdown(pass, bits)
{
   var el = document.getElementById('breakdown');
   if (! el) return;
   if (!pass || pass.length === 0 || !bits)
   {
      el.innerHTML = '';
      return;
   }
   var issues = analyzePassword(pass, bits);
   var html = '<h3>Strength breakdown</h3>';
   html += '<div class="issues">';
   for (var i = 0; i < issues.length; i++)
   {
      var it = issues[i];
      var cls = it.severity === 'critical' ? 'issue critical' : (it.severity === 'warning' ? 'issue warning' : 'issue info');
      html += '<div class="'+cls+'">';
      html += '<div class="left"><strong>'+it.title+'</strong>';
      if (it.detail) html += '<small>'+it.detail+'</small>';
      html += '</div>';
      if (it.action)
      {
         html += '<div class="suggestions"><button type="button" onclick="applySuggestion(\''+it.action+'\')">Apply</button></div>';
      }
      html += '</div>';
   }
   html += '</div>';
   el.innerHTML = html;
}

   /* --- Have I Been Pwned (k-Anonymity) integration --- */
   async function sha1Hex(str)
   {
      try {
         var enc = new TextEncoder();
         var buf = enc.encode(str);
         var hashBuf = await crypto.subtle.digest('SHA-1', buf);
         var arr = Array.from(new Uint8Array(hashBuf));
         var hex = arr.map(function(b){ return ('00' + b.toString(16)).slice(-2); }).join('');
         return hex.toUpperCase();
      } catch(e) { return null; }
   }

   async function checkPwned()
   {
      var el = document.getElementById('hibpResult');
      if (! el) return;
      var pass = document.passchk_form.passchk_pass.value || '';
      if (!pass)
      {
         el.innerHTML = '';
         return;
      }
      el.innerHTML = '<span class="checking">Checking breach database...</span>';
      try {
         var hex = await sha1Hex(pass);
         if (!hex) { el.innerHTML = '<span class="pwned">Error computing hash</span>'; return; }
         var prefix = hex.substr(0,5);
         var suffix = hex.substr(5);
         var url = 'https://api.pwnedpasswords.com/range/' + prefix;
         var resp = await fetch(url, { method: 'GET', headers: { 'Accept': 'text/plain' } });
         if (!resp.ok)
         {
            el.innerHTML = '<span class="pwned">Error contacting HIBP: ' + resp.status + '</span>';
            return;
         }
         var txt = await resp.text();
         var lines = txt.split('\n');
         var found = false; var count = 0;
         for (var i = 0; i < lines.length; i++)
         {
            var line = lines[i].trim();
            if (! line) continue;
            var parts = line.split(':');
            if (parts.length < 2) continue;
            var suf = parts[0].trim().toUpperCase();
            var c = parseInt(parts[1].trim(), 10) || 0;
            if (suf === suffix)
            {
               found = true; count = c; break;
            }
         }
         if (found)
         {
            el.innerHTML = '<span class="pwned">This password has been seen ' + count + ' times in data breaches — do NOT use it.</span>';
         }
         else
         {
            el.innerHTML = '<span class="safe">This password was NOT found in the HIBP breach list (based on k-Anonymity lookup).</span>';
         }
      } catch(e) {
         el.innerHTML = '<span class="pwned">Error checking HIBP</span>';
      }
   }

