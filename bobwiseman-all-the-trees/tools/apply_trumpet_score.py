"""Apply an explicitly confirmed listening score; run from project root with its exported JSON."""
from pathlib import Path
import json,sys
score=json.loads(Path(sys.argv[1]).read_text())
if score.get('verified') is not True or score.get('fps')!=24:raise SystemExit('A confirmed 24 fps score is required.')
intervals=score.get('intervals',[])
if not intervals:raise SystemExit('No trumpet intervals supplied.')
last=-1
for item in intervals:
 if not isinstance(item,list) or len(item)!=2 or any(type(x) is not int for x in item):raise SystemExit('Each interval must contain two integer frames.')
 start,end=item
 if not 0<=start<end<=3674 or start<last:raise SystemExit('Intervals must be ordered, within the song and non-overlapping.')
 last=end
out={'verified':True,'fps':24,'intervals':intervals,'source':score.get('source','Confirmed listening marks')}
Path('js/alchemy/trumpet-score.js').write_text('window.ALCHEMY_TRUMPET_SCORE='+json.dumps(out,separators=(',',':'))+';\n')
print(f'Applied {len(intervals)} confirmed trumpet intervals. Rerun cue checks and render review.')
